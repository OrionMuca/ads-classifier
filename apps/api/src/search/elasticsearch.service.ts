import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
    private client: Client;
    private readonly indexName = 'marketplace_posts_v2'; // Changed index name to force new mapping
    private readonly searchHistoryIndexName = 'marketplace_search_history';

    constructor(private configService: ConfigService) {
        this.client = new Client({
            node: this.configService.get<string>('ELASTICSEARCH_NODE'),
        });
    }

    async onModuleInit() {
        // Retry logic for Elasticsearch connection (handles startup race conditions)
        const maxRetries = 5;
        const retryDelay = 2000; // 2 seconds
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.client.ping();
                await this.createIndexIfNotExists();
                await this.createSearchHistoryIndexIfNotExists();
                console.log('✅ Elasticsearch indexes initialized successfully');
                return;
            } catch (error: any) {
                if (attempt === maxRetries) {
                    console.error(`❌ Failed to initialize Elasticsearch after ${maxRetries} attempts:`, error.message);
                    console.error('⚠️  Elasticsearch might not be ready yet. The service will continue, but search features may not work.');
                    return; // Don't crash the app, just log the error
                }
                console.log(`⏳ Elasticsearch not ready (attempt ${attempt}/${maxRetries}), retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    private async createIndexIfNotExists() {
        try {
            const exists = await this.client.indices.exists({ index: this.indexName });

            if (!exists) {
                await this.client.indices.create({
                index: this.indexName,
                settings: {
                    analysis: {
                        filter: {
                            autocomplete_filter: {
                                type: 'edge_ngram',
                                min_gram: 2,
                                max_gram: 20,
                            },
                        },
                        analyzer: {
                            autocomplete: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'autocomplete_filter'],
                            },
                        },
                    },
                },
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        title: {
                            type: 'text',
                            analyzer: 'autocomplete',
                            search_analyzer: 'standard', // Use standard for search query to avoid matching "f" to "fiat"
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                        description: { type: 'text' },
                        price: { type: 'float' },
                        status: { type: 'keyword' },
                        viewCount: { type: 'integer' },
                        // Denormalized category data
                        categoryId: { type: 'keyword' },
                        categoryName: {
                            type: 'text',
                            analyzer: 'autocomplete',
                            search_analyzer: 'standard',
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                        categorySlug: { type: 'keyword' },
                        // Denormalized location data
                        locationId: { type: 'keyword' },
                        city: { type: 'keyword' },
                        country: { type: 'keyword' },
                        // Other fields
                        images: { type: 'keyword' },
                        userId: { type: 'keyword' },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' },
                        // Autocomplete suggester
                        suggest: {
                            type: 'completion',
                        },
                    },
                },
            });
            }
        } catch (error: any) {
            // If index already exists or other non-critical error, log and continue
            if (error.message?.includes('resource_already_exists_exception')) {
                // Index already exists, that's fine
                return;
            }
            throw error; // Re-throw other errors to be handled by retry logic
        }
    }

    private async createSearchHistoryIndexIfNotExists() {
        try {
            const exists = await this.client.indices.exists({ index: this.searchHistoryIndexName });

            if (!exists) {
            await this.client.indices.create({
                index: this.searchHistoryIndexName,
                mappings: {
                    properties: {
                        userId: { type: 'keyword' },
                        query: { 
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword' } // For aggregations
                            }
                        },
                        categoryId: { type: 'keyword' },
                        locationId: { type: 'keyword' },
                        timestamp: { type: 'date' },
                        resultCount: { type: 'integer' },
                    },
                },
            });
        } else {
            // Try to update mapping if keyword field doesn't exist (won't fail if it does)
            try {
                await this.client.indices.putMapping({
                    index: this.searchHistoryIndexName,
                    properties: {
                        query: { 
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                    },
                });
            } catch (error) {
                // Ignore if mapping already exists or index doesn't support dynamic mapping
                console.log('Mapping update skipped:', error);
            }
        }
        } catch (error: any) {
            // If index already exists or other non-critical error, log and continue
            if (error.message?.includes('resource_already_exists_exception')) {
                // Index already exists, that's fine
                return;
            }
            throw error; // Re-throw other errors to be handled by retry logic
        }
    }


    async indexPost(post: any) {
        await this.client.index({
            index: this.indexName,
            id: post.id,
            document: {
                id: post.id,
                title: post.title,
                description: post.description,
                price: parseFloat(post.price.toString()),
                status: post.status || 'ACTIVE',
                viewCount: post.viewCount || 0,
                // Denormalized category
                categoryId: post.categoryId || post.category?.id,
                categoryName: post.category?.name,
                categorySlug: post.category?.slug,
                // Denormalized location
                locationId: post.locationId || post.location?.id,
                city: post.location?.city,
                country: post.location?.country || 'Albania',
                // Denormalized zone
                zoneId: post.zoneId || post.zone?.id,
                zoneName: post.zone?.name,
                // Other fields
                images: post.images,
                userId: post.userId,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                // Suggest field
                suggest: [
                    {
                        input: post.title,
                        weight: 10,
                    },
                    {
                        input: post.category?.name,
                        weight: 5,
                    }
                ].filter(s => s.input),
            },
        });
    }

    async updatePost(post: any) {
        await this.indexPost(post);
    }

    async deletePost(postId: string) {
        await this.client.delete({
            index: this.indexName,
            id: postId,
        });
    }

    async search(params: {
        query?: string;
        categoryId?: string;
        locationId?: string;
        minPrice?: number;
        maxPrice?: number;
        searchAfter?: any[];
        size?: number;
        userCity?: string;
        sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular';
    }) {
        const must: any[] = [];
        const filter: any[] = [];

        // Text search
        if (params.query) {
            must.push({
                multi_match: {
                    query: params.query,
                    fields: ['title^3', 'categoryName^2', 'description'],
                    fuzziness: 'AUTO',
                },
            });
        } else {
            must.push({ match_all: {} });
        }

        // Filter by active status
        filter.push({ term: { status: 'ACTIVE' } });

        // Filters
        if (params.categoryId) {
            filter.push({ term: { categoryId: params.categoryId } });
        }

        if (params.locationId) {
            filter.push({ term: { locationId: params.locationId } });
        }

        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
            const range: any = {};
            if (params.minPrice !== undefined) range.gte = params.minPrice;
            if (params.maxPrice !== undefined) range.lte = params.maxPrice;
            filter.push({ range: { price: range } });
        }

        // Determine sort order based on sortBy parameter
        let sort: any[] = [];
        switch (params.sortBy) {
            case 'price-low':
                sort = [
                    { price: 'asc' },
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ];
                break;
            case 'price-high':
                sort = [
                    { price: 'desc' },
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ];
                break;
            case 'popular':
                // Sort by viewCount if available, otherwise by createdAt
                sort = [
                    { viewCount: { missing: '_last', order: 'desc' } },
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ];
                break;
            case 'newest':
            default:
                sort = [
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ];
                break;
        }

        // Execute search with dynamic sort
        const result = await this.client.search({
            index: this.indexName,
            size: params.size || 20,
            query: {
                bool: {
                    must,
                    filter,
                },
            },
            sort,
            search_after: params.searchAfter,
        });

        return {
            hits: result.hits.hits.map((hit: any) => ({
                ...hit._source,
                sort: hit.sort,
            })),
            total: typeof result.hits.total === 'number'
                ? result.hits.total
                : result.hits.total?.value || 0,
        };
    }

    async getSuggestions(query: string, userId?: string) {
        const suggestions: any[] = [];
        const queryLower = query.toLowerCase().trim();

        // If query is provided, get autocomplete suggestions
        if (query && query.length >= 2) {
            // Use both completion suggester and text search for better results
            const [completionResult, textSearchResult] = await Promise.all([
                // Completion suggester (fast prefix matching)
                this.client.search({
                    index: this.indexName,
                    body: {
                        suggest: {
                            post_suggest: {
                                prefix: query,
                                completion: {
                                    field: 'suggest',
                                    skip_duplicates: true,
                                    size: 10,
                                },
                            },
                        },
                    },
                }),
                // Text search for partial matches (better for typos and partial words)
                this.client.search({
                    index: this.indexName,
                    size: 5,
                    body: {
                        query: {
                            bool: {
                                should: [
                                    {
                                        match: {
                                            title: {
                                                query: query,
                                                boost: 3,
                                                fuzziness: 'AUTO',
                                            },
                                        },
                                    },
                                    {
                                        match: {
                                            categoryName: {
                                                query: query,
                                                boost: 2,
                                                fuzziness: 'AUTO',
                                            },
                                        },
                                    },
                                ],
                                minimum_should_match: 1,
                            },
                        },
                        _source: ['title', 'categoryName'],
                    },
                }),
            ]);

            // Process completion suggestions
            const completionSuggestions = (completionResult.suggest?.['post_suggest'] as any)?.[0]?.options?.map((option: any) => ({
                text: option.text,
                score: option._score * 1.2, // Boost completion suggester
                type: 'autocomplete',
            })) || [];

            // Process text search results (extract unique titles/categories)
            const textSuggestions = new Map<string, number>();
            textSearchResult.hits.hits.forEach((hit: any) => {
                const title = hit._source?.title;
                const categoryName = hit._source?.categoryName;
                const score = hit._score || 0;

                if (title && typeof title === 'string') {
                    const titleLower = title.toLowerCase();
                    // Extract words that match the query for better suggestions
                    const words = title.split(/\s+/);
                    words.forEach((word: string) => {
                        const wordLower = word.toLowerCase();
                        if (wordLower.startsWith(queryLower) || wordLower.includes(queryLower)) {
                            const boost = wordLower.startsWith(queryLower) ? 1.5 : 1.0;
                            const existingScore = textSuggestions.get(word) || 0;
                            textSuggestions.set(word, Math.max(existingScore, score * boost));
                        }
                    });
                    // Also add full title if it matches
                    if (titleLower.includes(queryLower)) {
                        const existingScore = textSuggestions.get(title) || 0;
                        textSuggestions.set(title, Math.max(existingScore, score * 1.2));
                    }
                }
                if (categoryName && typeof categoryName === 'string') {
                    const categoryLower = categoryName.toLowerCase();
                    if (categoryLower.includes(queryLower)) {
                        const existingScore = textSuggestions.get(categoryName) || 0;
                        textSuggestions.set(categoryName, Math.max(existingScore, score * 0.9));
                    }
                }
            });

            // Convert to array and merge with completion suggestions
            Array.from(textSuggestions.entries()).forEach(([text, score]) => {
                const existing = completionSuggestions.find(s => s.text.toLowerCase() === text.toLowerCase());
                if (existing) {
                    existing.score = Math.max(existing.score, score);
                } else {
                    completionSuggestions.push({
                        text,
                        score,
                        type: 'autocomplete',
                    });
                }
            });

            suggestions.push(...completionSuggestions);
        }

        // For logged-in users, add search history suggestions
        if (userId) {
            const history = await this.getUserSearchHistory(userId, 15);
            const historyQueries = history
                .filter((h: any) => h.query && h.query.trim().length > 0)
                .map((h: any) => {
                    const historyQueryLower = h.query.toLowerCase();
                    
                    // Calculate relevance score based on:
                    // 1. Recency (more recent = higher score)
                    // 2. Result count (more results = better match)
                    // 3. Query similarity to current input
                    const daysSinceSearch = (Date.now() - new Date(h.timestamp).getTime()) / (1000 * 60 * 60 * 24);
                    const recencyScore = Math.max(0, 100 - daysSinceSearch * 3); // Decay over time
                    const resultScore = Math.min(30, (h.resultCount || 0) / 5); // Cap at 30
                    
                    let similarityScore = 0;
                    if (query && query.length > 0) {
                        if (historyQueryLower.startsWith(queryLower)) {
                            similarityScore = 150; // Exact prefix match - highest priority
                        } else if (historyQueryLower.includes(queryLower)) {
                            similarityScore = 80; // Contains match
                        } else {
                            // Calculate similarity for typos
                            const similarity = this.calculateSimilarity(queryLower, historyQueryLower);
                            similarityScore = similarity * 50;
                        }
                    } else {
                        similarityScore = recencyScore; // For empty query, use recency
                    }

                    return {
                        text: h.query,
                        score: recencyScore + resultScore + similarityScore,
                        type: 'history',
                        timestamp: h.timestamp,
                    };
                })
                .filter((h: any) => query.length === 0 || h.score > 50) // Filter low relevance if query exists
                .slice(0, 8);

            // Merge and deduplicate, prioritizing history
            const existingTexts = new Set(suggestions.map(s => s.text.toLowerCase()));
            historyQueries.forEach((h: any) => {
                if (!existingTexts.has(h.text.toLowerCase())) {
                    suggestions.unshift(h); // Add history at the beginning
                } else {
                    // If exists, boost the score if it's from history
                    const existing = suggestions.find(s => s.text.toLowerCase() === h.text.toLowerCase());
                    if (existing && h.score > existing.score) {
                        existing.score = h.score;
                        existing.type = 'history';
                    }
                }
            });
        }

        // Sort by score (history first, then autocomplete)
        suggestions.sort((a, b) => {
            if (a.type === 'history' && b.type !== 'history') return -1;
            if (a.type !== 'history' && b.type === 'history') return 1;
            return b.score - a.score;
        });

        return suggestions.slice(0, 10); // Return top 10
    }

    // Simple similarity calculation (Jaro-Winkler inspired)
    private calculateSimilarity(str1: string, str2: string): number {
        if (str1 === str2) return 1;
        if (str1.length === 0 || str2.length === 0) return 0;

        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1;

        // Calculate common characters
        const matchWindow = Math.floor(longer.length / 2) - 1;
        const matches1 = new Array(str1.length).fill(false);
        const matches2 = new Array(str2.length).fill(false);

        let matches = 0;
        let transpositions = 0;

        for (let i = 0; i < shorter.length; i++) {
            const start = Math.max(0, i - matchWindow);
            const end = Math.min(i + matchWindow + 1, longer.length);

            for (let j = start; j < end; j++) {
                if (matches2[j] || shorter[i] !== longer[j]) continue;
                matches1[i] = matches2[j] = true;
                matches++;
                break;
            }
        }

        if (matches === 0) return 0;

        let k = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (!matches1[i]) continue;
            while (!matches2[k]) k++;
            if (shorter[i] !== longer[k]) transpositions++;
            k++;
        }

        const jaro = (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3;
        
        // Prefix bonus
        let prefix = 0;
        for (let i = 0; i < Math.min(4, Math.min(str1.length, str2.length)); i++) {
            if (str1[i] === str2[i]) prefix++;
            else break;
        }

        return jaro + (0.1 * prefix * (1 - jaro));
    }

    async getTrendingSearches(limit: number = 10) {
        try {
            // Aggregate search queries from search history to find trending searches
            const result = await this.client.search({
                index: this.searchHistoryIndexName,
                size: 0, // We only want aggregations
                body: {
                    aggs: {
                        trending_searches: {
                            terms: {
                                field: 'query.keyword', // Use keyword field for aggregations
                                size: limit * 2, // Get more to filter out empty queries
                                min_doc_count: 2, // At least 2 searches
                            },
                        },
                    },
                    query: {
                        bool: {
                            must: [
                                {
                                    range: {
                                        timestamp: {
                                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
                                        },
                                    },
                                },
                            ],
                            must_not: [
                                {
                                    term: {
                                        'query.keyword': '', // Exclude empty queries
                                    },
                                },
                            ],
                        },
                    },
                },
            });

            const trending = (result.aggregations?.trending_searches as any)?.buckets
                ?.filter((bucket: any) => bucket.key && bucket.key.trim().length > 0) // Filter out empty keys
                .slice(0, limit)
                .map((bucket: any) => ({
                    text: bucket.key.trim(),
                    count: bucket.doc_count,
                    type: 'trending',
                })) || [];

            return trending;
        } catch (error) {
            console.error('Error fetching trending searches:', error);
            return [];
        }
    }

    async getPopularProducts(size: number = 20) {
        // Get products sorted by view count and recency
        const result = await this.client.search({
            index: this.indexName,
            size,
            query: {
                bool: {
                    must: [
                        { match_all: {} },
                    ],
                    filter: [
                        { term: { status: 'ACTIVE' } },
                    ],
                },
            },
            sort: [
                { viewCount: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return {
            hits: result.hits.hits.map((hit: any) => ({
                ...hit._source,
            })),
            total: typeof result.hits.total === 'number'
                ? result.hits.total
                : result.hits.total?.value || 0,
        };
    }

    async reindexAll(posts: any[]) {
        // Delete and recreate index to ensure clean state
        const indexExists = await this.client.indices.exists({ index: this.indexName });
        if (indexExists) {
            await this.client.indices.delete({ index: this.indexName });
        }
        await this.createIndexIfNotExists();

        // Bulk index
        const body = posts.flatMap((post) => [
            { index: { _index: this.indexName, _id: post.id } },
            {
                id: post.id,
                title: post.title,
                description: post.description,
                price: post.price,
                status: post.status || 'ACTIVE',
                viewCount: post.viewCount || 0,
                categoryId: post.categoryId,
                categoryName: post.category.name,
                locationId: post.locationId,
                locationCity: post.location.city,
                images: post.images,
                userId: post.userId,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                suggest: [
                    { input: post.title, weight: 10 },
                    { input: post.category.name, weight: 5 },
                ],
            },
        ]);

        if (body.length > 0) {
            const { errors, items } = await this.client.bulk({ refresh: true, body });
            if (errors) {
                console.error('Bulk indexing errors', items);
            }
            return { count: items.length, errors };
        }
        return { count: 0, errors: false };
    }

    // Search History Tracking
    async recordSearch(userId: string, params: {
        query?: string;
        categoryId?: string;
        locationId?: string;
        resultCount: number;
    }) {
        if (!userId) return; // Skip if user not authenticated

        await this.client.index({
            index: this.searchHistoryIndexName,
            document: {
                userId,
                query: params.query || '',
                categoryId: params.categoryId || null,
                locationId: params.locationId || null,
                timestamp: new Date().toISOString(),
                resultCount: params.resultCount,
            },
        });
    }

    async getUserSearchHistory(userId: string, limit: number = 50) {
        const result = await this.client.search({
            index: this.searchHistoryIndexName,
            size: limit,
            query: {
                term: { userId },
            },
            sort: [{ timestamp: 'desc' }],
        });

        return result.hits.hits.map((hit: any) => hit._source);
    }

    async getPersonalizedRecommendations(userId: string, size: number = 20) {
        // Get user's search history from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const historyResult = await this.client.search({
            index: this.searchHistoryIndexName,
            size: 100,
            query: {
                bool: {
                    must: [
                        { term: { userId } },
                    ],
                    filter: [
                        {
                            range: {
                                timestamp: {
                                    gte: thirtyDaysAgo.toISOString(),
                                },
                            },
                        },
                    ],
                },
            },
        });

        const searchHistory = historyResult.hits.hits.map((hit: any) => hit._source);

        if (searchHistory.length === 0) {
            return { hits: [], total: 0 };
        }

        // Aggregate most searched categories
        const categoryCount: { [key: string]: number } = {};
        searchHistory.forEach((search: any) => {
            if (search.categoryId) {
                categoryCount[search.categoryId] = (categoryCount[search.categoryId] || 0) + 1;
            }
        });

        // Get top categories (sorted by frequency)
        const topCategories = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([categoryId]) => categoryId);

        if (topCategories.length === 0) {
            // No category preferences, return recent posts
            return this.search({ size });
        }

        // Search for posts in top categories
        const result = await this.client.search({
            index: this.indexName,
            size,
            query: {
                bool: {
                    must: [
                        {
                            terms: {
                                categoryId: topCategories,
                            },
                        },
                    ],
                    filter: [
                        { term: { status: 'ACTIVE' } },
                    ],
                },
            },
            sort: [
                { createdAt: 'desc' },
            ],
        });

        return {
            hits: result.hits.hits.map((hit: any) => ({
                ...hit._source,
                _recommended: true,
                _recommendedReason: 'Based on your search history',
            })),
            total: typeof result.hits.total === 'number'
                ? result.hits.total
                : result.hits.total?.value || 0,
            topCategories,
        };
    }
}
