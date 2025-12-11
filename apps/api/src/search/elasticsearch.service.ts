import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import {
    POST_INDEX_MAPPING,
    SEARCH_HISTORY_INDEX_MAPPING,
    getPostsIndexName,
    INDEX_NAMES,
} from './elasticsearch.mapping';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
    private readonly logger = new Logger(ElasticsearchService.name);
    private client: Client;
    private readonly indexName: string;
    private readonly indexAlias: string;
    private readonly searchHistoryIndexName: string;
    
    // In-memory cache with TTL
    private cache: Map<string, { data: any; expires: number }> = new Map();
    
    // Request deduplication - track pending requests
    private pendingRequests: Map<string, Promise<any>> = new Map();
    
    // Simple rate limiter - track requests per key
    private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

    constructor(
        private configService: ConfigService,
        @Inject(forwardRef(() => CategoriesService))
        private categoriesService: CategoriesService,
    ) {
        this.client = new Client({
            node: this.configService.get<string>('ELASTICSEARCH_NODE'),
        });
        this.indexName = getPostsIndexName();
        this.indexAlias = INDEX_NAMES.POSTS_ALIAS;
        this.searchHistoryIndexName = INDEX_NAMES.SEARCH_HISTORY;
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
                this.logger.log('✅ Elasticsearch indexes initialized successfully');
                return;
            } catch (error: any) {
                if (attempt === maxRetries) {
                    this.logger.error(`❌ Failed to initialize Elasticsearch after ${maxRetries} attempts: ${error.message}`);
                    this.logger.warn('⚠️  Elasticsearch might not be ready yet. The service will continue, but search features may not work.');
                    return; // Don't crash the app, just log the error
                }
                this.logger.log(`⏳ Elasticsearch not ready (attempt ${attempt}/${maxRetries}), retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    private async createIndexIfNotExists() {
        try {
            const exists = await this.client.indices.exists({ index: this.indexName });

            if (!exists) {
                // Create index with standardized mapping
                await this.client.indices.create({
                    index: this.indexName,
                    ...POST_INDEX_MAPPING,
                });

                // Create or update alias to point to this index
                const aliasExists = await this.client.indices.existsAlias({ name: this.indexAlias });
                if (aliasExists) {
                    // Remove alias from old index(es) and add to new one
                    const currentAliases = await this.client.indices.getAlias({ name: this.indexAlias });
                    const actions: any[] = Object.keys(currentAliases).map((oldIndex) => ({
                        remove: { index: oldIndex, alias: this.indexAlias },
                    }));
                    actions.push({
                        add: { index: this.indexName, alias: this.indexAlias, is_write_index: true },
                    });
                    await this.client.indices.updateAliases({ body: { actions } });
                } else {
                    // Create new alias pointing to the new index
                    await this.client.indices.putAlias({
                        index: this.indexName,
                        name: this.indexAlias,
                        body: {
                            is_write_index: true,
                        },
                    });
                }

                this.logger.log(`✅ Created index ${this.indexName} with alias ${this.indexAlias}`);
            } else {
                // Index exists, ensure alias is set
                const aliasExists = await this.client.indices.existsAlias({
                    name: this.indexAlias,
                    index: this.indexName,
                });
                if (!aliasExists) {
                    await this.client.indices.putAlias({
                        index: this.indexName,
                        name: this.indexAlias,
                        body: {
                            is_write_index: true,
                        },
                    });
                    this.logger.log(`✅ Added alias ${this.indexAlias} to existing index ${this.indexName}`);
                }
            }
        } catch (error: any) {
            if (error.message?.includes('resource_already_exists_exception')) {
                this.logger.log(`Index ${this.indexName} already exists`);
                return;
            }
            this.logger.error(`Failed to create index ${this.indexName}:`, error.message);
            throw error;
        }
    }

    private async createSearchHistoryIndexIfNotExists() {
        try {
            const exists = await this.client.indices.exists({ index: this.searchHistoryIndexName });

            if (!exists) {
                await this.client.indices.create({
                    index: this.searchHistoryIndexName,
                    ...SEARCH_HISTORY_INDEX_MAPPING,
                });
                this.logger.log(`✅ Created search history index ${this.searchHistoryIndexName}`);
            }
        } catch (error: any) {
            if (error.message?.includes('resource_already_exists_exception')) {
                this.logger.log(`Search history index ${this.searchHistoryIndexName} already exists`);
                return;
            }
            this.logger.error(`Failed to create search history index:`, error.message);
            throw error;
        }
    }


    async indexPost(post: any) {
        try {
            await this.client.index({
                index: this.indexAlias, // Use alias for zero-downtime
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
                userIsActive: post.user?.isActive ?? true, // Default to true if not provided
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
            this.logger.debug(`Indexed post ${post.id}`);
        } catch (error: any) {
            this.logger.error(`Failed to index post ${post.id}:`, error.message);
            // Don't throw - allow DB operation to succeed, ES will be synced later
            throw error; // Re-throw for now, can be made non-blocking later
        }
    }

    async updatePost(post: any) {
        await this.indexPost(post);
    }

    async deletePost(postId: string) {
        try {
            await this.client.delete({
                index: this.indexAlias, // Use alias
                id: postId,
            });
            this.logger.debug(`Deleted post ${postId} from index`);
        } catch (error: any) {
            // If document doesn't exist, that's okay (idempotent)
            if (error.statusCode === 404) {
                this.logger.debug(`Post ${postId} not found in index (already deleted or never indexed)`);
                return;
            }
            this.logger.error(`Failed to delete post ${postId}:`, error.message);
            throw error;
        }
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
        
        // Filter by active users only (if field exists)
        filter.push({
            bool: {
                should: [
                    { term: { userIsActive: true } },
                    { bool: { must_not: { exists: { field: 'userIsActive' } } } }, // Include docs without the field
                ],
                minimum_should_match: 1,
            },
        });

        // Filters - Category (with hierarchical support)
        if (params.categoryId) {
            try {
                // Get all category IDs to search (parent + children)
                const categoryIds = await this.categoriesService.getCategoryIdsForFilter(params.categoryId);
                
                if (categoryIds.length === 0) {
                    // Category doesn't exist, no results
                    this.logger.warn(`Category ${params.categoryId} not found`);
                    filter.push({ term: { categoryId: 'non-existent-category-id' } });
                } else if (categoryIds.length === 1) {
                    // No children, use simple term query
                    filter.push({ term: { categoryId: categoryIds[0] } });
                } else {
                    // Has children, use terms query to match any of them
                    filter.push({ terms: { categoryId: categoryIds } });
                }
            } catch (error) {
                // Fallback to simple query if service fails
                this.logger.error('Error getting category hierarchy:', error);
                filter.push({ term: { categoryId: params.categoryId } });
            }
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
        // Note: id is now keyword type, so we can sort by it directly
        let sort: any[] = [];
        switch (params.sortBy) {
            case 'price-low':
                sort = [
                    { price: 'asc' },
                    { createdAt: 'desc' },
                    { id: 'desc' }, // id is keyword, can be sorted
                ];
                break;
            case 'price-high':
                sort = [
                    { price: 'desc' },
                    { createdAt: 'desc' },
                    { id: 'desc' }, // id is keyword, can be sorted
                ];
                break;
            case 'popular':
                // Sort by viewCount if available, otherwise by createdAt
                sort = [
                    { viewCount: { missing: '_last', order: 'desc' } },
                    { createdAt: 'desc' },
                    { id: 'desc' }, // id is keyword, can be sorted
                ];
                break;
            case 'newest':
            default:
                sort = [
                    { createdAt: 'desc' },
                    { id: 'desc' }, // id is keyword, can be sorted
                ];
                break;
        }

        // Execute search with dynamic sort - use alias for zero-downtime migrations
        const searchQuery = {
            index: this.indexAlias,
            size: params.size || 20,
            query: {
                bool: {
                    must,
                    filter,
                },
            },
            sort,
            search_after: params.searchAfter,
        };

        // Debug logging
        this.logger.debug('Elasticsearch search query:', JSON.stringify(searchQuery, null, 2));
        this.logger.debug('Search params:', JSON.stringify(params, null, 2));

        try {
            const result = await this.client.search(searchQuery);

            this.logger.debug(`Search results: ${result.hits.hits.length} hits, total: ${typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0}`);

            return {
                hits: result.hits.hits.map((hit: any) => ({
                    ...hit._source,
                    sort: hit.sort,
                })),
                total: typeof result.hits.total === 'number'
                    ? result.hits.total
                    : result.hits.total?.value || 0,
                isEmpty: result.hits.hits.length === 0,
            };
        } catch (error: any) {
            this.logger.error('Elasticsearch search error:', error.message);
            // Return empty results instead of throwing error
            return {
                hits: [],
                total: 0,
                isEmpty: true,
            };
        }
    }

    async getSuggestions(query: string, userId?: string, sessionId?: string) {
        const cacheKey = `suggestions_${query}_${userId || sessionId || 'anon'}`;
        const cached = this.getCached(cacheKey);
        if (cached) {
            return cached;
        }

        // Rate limiting
        const rateLimitKey = `suggest_${userId || sessionId || 'ip'}`;
        if (!this.checkRateLimit(rateLimitKey, 200, 60000)) {
            this.logger.warn(`Rate limit exceeded for suggestions: ${rateLimitKey}`);
            return [];
        }

        return this.withDeduplication(cacheKey, async () => {
            const suggestions: any[] = [];
            const queryLower = query.toLowerCase().trim();

            // Check if we have any posts - return empty if not
            const hasPosts = await this.hasPosts();
            if (!hasPosts && query.length >= 2) {
                const emptyResult: any[] = [];
                this.setCache(cacheKey, emptyResult, 1 * 60 * 1000); // 1 min cache
                return emptyResult;
            }

        // Get user preferences for personalization
        let userPreferences: { categories: string[]; locations: string[] } = { categories: [], locations: [] };
        if (userId || sessionId) {
            const history = await this.getUserSearchHistory(userId, sessionId, 50);
            const categoryCount: { [key: string]: number } = {};
            const locationCount: { [key: string]: number } = {};
            
            history.forEach((h: any) => {
                if (h.categoryId) {
                    categoryCount[h.categoryId] = (categoryCount[h.categoryId] || 0) + 1;
                }
                if (h.locationId) {
                    locationCount[h.locationId] = (locationCount[h.locationId] || 0) + 1;
                }
            });
            
            userPreferences.categories = Object.entries(categoryCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([id]) => id);
            userPreferences.locations = Object.entries(locationCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([id]) => id);
        }

        // Get trending searches for boost
        const trendingSearches = await this.getTrendingSearches(20);
        const trendingMap = new Map(trendingSearches.map((t: any) => [t.text.toLowerCase(), t.count]));

        // If query is provided, get autocomplete suggestions
        if (query && query.length >= 2) {
            // Use both completion suggester and text search for better results
            const [completionResult, textSearchResult] = await Promise.all([
                // Completion suggester (fast prefix matching)
                this.client.search({
                    index: this.indexAlias,
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
                    index: this.indexAlias,
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

            // Process completion suggestions with personalization and trending boost
            const completionSuggestions = (completionResult.suggest?.['post_suggest'] as any)?.[0]?.options?.map((option: any) => {
                let score = option._score * 1.2; // Base boost for completion suggester
                
                // Trending boost
                const trendingCount = trendingMap.get(option.text.toLowerCase());
                if (trendingCount && typeof trendingCount === 'number') {
                    score += Math.min(50, trendingCount * 5); // Cap trending boost at 50
                }
                
                return {
                    text: option.text,
                    score,
                    type: 'autocomplete',
                };
            }) || [];

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

        // For logged-in users or anonymous users with session, add search history suggestions
        if (userId || sessionId) {
            const history = await this.getUserSearchHistory(userId, sessionId, 15);
            const historyQueries = history
                .filter((h: any) => h.query && h.query.trim().length > 0)
                .map((h: any) => {
                    const historyQueryLower = h.query.toLowerCase();
                    
                    // Calculate relevance score based on:
                    // 1. Recency (more recent = higher score)
                    // 2. Result count (more results = better match)
                    // 3. Query similarity to current input
                    // 4. User engagement (clicked results, conversions)
                    // 5. Search frequency (how many times searched)
                    const daysSinceSearch = (Date.now() - new Date(h.timestamp).getTime()) / (1000 * 60 * 60 * 24);
                    const recencyScore = Math.max(0, 100 - daysSinceSearch * 3); // Decay over time
                    const resultScore = Math.min(30, (h.resultCount || 0) / 5); // Cap at 30
                    
                    // Engagement score (clicked results and conversions)
                    const clickedCount = (h.clickedResults?.length || 0);
                    const engagementScore = Math.min(40, clickedCount * 5 + (h.converted ? 20 : 0));
                    
                    // Frequency score (how many times this search was performed)
                    const frequencyScore = Math.min(30, (h.searchCount || 1) * 5);
                    
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
                    
                    // Personalization boost (if matches user's preferred categories/locations)
                    let personalizationBoost = 0;
                    if (h.categoryId && userPreferences.categories.includes(h.categoryId)) {
                        personalizationBoost += 25;
                    }
                    if (h.locationId && userPreferences.locations.includes(h.locationId)) {
                        personalizationBoost += 15;
                    }
                    
                    // Trending boost
                    const trendingCount = trendingMap.get(historyQueryLower);
                    const trendingBoost = (trendingCount && typeof trendingCount === 'number') ? Math.min(30, trendingCount * 3) : 0;

                    return {
                        text: h.query,
                        score: recencyScore + resultScore + similarityScore + engagementScore + frequencyScore + personalizationBoost + trendingBoost,
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

            const result = suggestions.slice(0, 10); // Return top 10
            this.setCache(cacheKey, result, 1 * 60 * 1000); // Cache for 1 minute
            return result;
        });
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
        const cacheKey = `trending_searches_${limit}`;
        const cached = this.getCached(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            // Check if search history index exists and has documents
            const indexExists = await this.client.indices.exists({ 
                index: this.searchHistoryIndexName 
            });
            
            if (!indexExists) {
                const emptyResult: any[] = [];
                this.setCache(cacheKey, emptyResult, 5 * 60 * 1000); // 5 min cache
                return emptyResult;
            }

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

            // Cache for 5 minutes
            this.setCache(cacheKey, trending, 5 * 60 * 1000);
            return trending;
        } catch (error: any) {
            this.logger.error('Error fetching trending searches:', error.message);
            return [];
        }
    }

    /**
     * Check if index has any documents
     */
    private async hasPosts(): Promise<boolean> {
        try {
            const count = await this.client.count({
                index: this.indexAlias,
                query: {
                    term: { status: 'ACTIVE' },
                },
            });
            return count.count > 0;
        } catch (error) {
            this.logger.warn('Failed to check post count:', error);
            return false;
        }
    }

    /**
     * Get cached data or null if expired/missing
     */
    private getCached(key: string): any | null {
        const cached = this.cache.get(key);
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }
        if (cached) {
            this.cache.delete(key);
        }
        return null;
    }

    /**
     * Set cache with TTL in milliseconds
     */
    private setCache(key: string, data: any, ttlMs: number): void {
        this.cache.set(key, {
            data,
            expires: Date.now() + ttlMs,
        });
    }

    /**
     * Check rate limit - returns true if allowed, false if rate limited
     */
    private checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
        const now = Date.now();
        const limit = this.rateLimitMap.get(key);
        
        if (!limit || now > limit.resetTime) {
            this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }
        
        if (limit.count >= maxRequests) {
            return false;
        }
        
        limit.count++;
        return true;
    }

    /**
     * Execute with request deduplication - same request within 100ms returns cached promise
     */
    private async withDeduplication<T>(key: string, fn: () => Promise<T>, dedupeWindowMs: number = 100): Promise<T> {
        const pending = this.pendingRequests.get(key);
        if (pending) {
            return pending;
        }
        
        const promise = fn().finally(() => {
            // Remove from pending after a short delay to allow deduplication
            setTimeout(() => {
                this.pendingRequests.delete(key);
            }, dedupeWindowMs);
        });
        
        this.pendingRequests.set(key, promise);
        return promise;
    }

    async getPopularProducts(size: number = 20) {
        const cacheKey = `popular_products_${size}`;
        const cached = this.getCached(cacheKey);
        if (cached) {
            return cached;
        }

        // Check if we have any posts
        const hasPosts = await this.hasPosts();
        if (!hasPosts) {
            const emptyResult = {
                hits: [],
                total: 0,
                isEmpty: true,
            };
            this.setCache(cacheKey, emptyResult, 15 * 60 * 1000); // 15 min cache
            return emptyResult;
        }

        try {
            // Get products sorted by view count and recency
            const result = await this.client.search({
                index: this.indexAlias,
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
                    { viewCount: { missing: '_last', order: 'desc' } },
                    { createdAt: 'desc' },
                ],
            });

            const response = {
                hits: result.hits.hits.map((hit: any) => ({
                    ...hit._source,
                })),
                total: typeof result.hits.total === 'number'
                    ? result.hits.total
                    : result.hits.total?.value || 0,
                isEmpty: false,
            };

            // Cache for 15 minutes
            this.setCache(cacheKey, response, 15 * 60 * 1000);
            return response;
        } catch (error: any) {
            this.logger.error('Failed to get popular products:', error.message);
            return {
                hits: [],
                total: 0,
                isEmpty: true,
            };
        }
    }

    async getTrendingProducts(size: number = 8) {
        const cacheKey = `trending_products_${size}`;
        const cached = this.getCached(cacheKey);
        if (cached) {
            return cached;
        }

        // Check if we have any posts
        const hasPosts = await this.hasPosts();
        if (!hasPosts) {
            const emptyResult = {
                hits: [],
                total: 0,
                isEmpty: true,
            };
            this.setCache(cacheKey, emptyResult, 10 * 60 * 1000); // 10 min cache
            return emptyResult;
        }

        try {
            // Time-weighted trending algorithm
            // Boost products with recent views and high view counts
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Get products with function_score to weight by recency and view count
            const result = await this.client.search({
                index: this.indexAlias,
                size,
                query: {
                    function_score: {
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
                        functions: [
                            {
                                // Boost by view count
                                field_value_factor: {
                                    field: 'viewCount',
                                    factor: 0.1,
                                    modifier: 'log1p',
                                    missing: 0,
                                },
                                weight: 2.0,
                            },
                            {
                                // Boost by recency (products created in last 7 days)
                                filter: {
                                    range: {
                                        createdAt: {
                                            gte: sevenDaysAgo.toISOString(),
                                        },
                                    },
                                },
                                weight: 1.5,
                            },
                            {
                                // Boost by recency (products created in last 30 days)
                                filter: {
                                    range: {
                                        createdAt: {
                                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                                        },
                                    },
                                },
                                weight: 1.2,
                            },
                        ],
                        score_mode: 'sum',
                        boost_mode: 'multiply',
                    },
                },
                sort: [
                    '_score',
                    { createdAt: 'desc' },
                ],
            });

            const response = {
                hits: result.hits.hits.map((hit: any) => ({
                    ...hit._source,
                    _trendingScore: hit._score,
                    _trendingReason: hit._source.viewCount > 0 
                        ? 'Popular and trending' 
                        : 'Recently added',
                })),
                total: typeof result.hits.total === 'number'
                    ? result.hits.total
                    : result.hits.total?.value || 0,
                isEmpty: false,
            };

            // Cache for 10 minutes
            this.setCache(cacheKey, response, 10 * 60 * 1000);
            return response;
        } catch (error: any) {
            this.logger.error('Failed to get trending products:', error.message);
            return {
                hits: [],
                total: 0,
                isEmpty: true,
            };
        }
    }

    async reindexAll(posts: any[]) {
        // Delete and recreate index to ensure clean state
        const indexExists = await this.client.indices.exists({ index: this.indexName });
        if (indexExists) {
            await this.client.indices.delete({ index: this.indexName });
        }
        await this.createIndexIfNotExists();

        // Bulk index - use alias for writes
        const body = posts.flatMap((post) => [
            { index: { _index: this.indexAlias, _id: post.id } },
            {
                id: post.id,
                title: post.title,
                description: post.description,
                price: parseFloat(post.price?.toString() || '0'),
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
                images: post.images || [],
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
                ].filter((s: any) => s.input),
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
    async recordSearch(userId: string | undefined, sessionId: string | undefined, params: {
        query?: string;
        categoryId?: string;
        locationId?: string;
        resultCount: number;
        clickedResults?: string[];
        dwellTime?: number;
        converted?: boolean;
    }) {
        // Skip if neither userId nor sessionId provided
        if (!userId && !sessionId) return;

        // Check if similar search exists within last 5 minutes to avoid duplicates
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        try {
            const existingSearch = await this.client.search({
                index: this.searchHistoryIndexName,
                size: 1,
                query: {
                    bool: {
                        must: [
                            {
                                range: {
                                    timestamp: {
                                        gte: fiveMinutesAgo,
                                    },
                                },
                            },
                            {
                                term: {
                                    'query.keyword': params.query || '',
                                },
                            },
                        ],
                        should: [
                            ...(userId ? [{ term: { userId } }] : []),
                            ...(sessionId ? [{ term: { sessionId } }] : []),
                        ],
                        minimum_should_match: 1,
                    },
                },
            });

            // If similar search exists, update it instead of creating duplicate
            if (existingSearch.hits.hits.length > 0) {
                const existingDoc = existingSearch.hits.hits[0];
                const existingSource = existingDoc._source as any;
                
                await this.client.update({
                    index: this.searchHistoryIndexName,
                    id: existingDoc._id,
                    doc: {
                        timestamp: new Date().toISOString(),
                        resultCount: params.resultCount,
                        searchCount: (existingSource.searchCount || 1) + 1,
                        clickedResults: params.clickedResults || existingSource.clickedResults || [],
                        dwellTime: params.dwellTime || existingSource.dwellTime || 0,
                        converted: params.converted !== undefined ? params.converted : existingSource.converted || false,
                    },
                });
                return;
            }
        } catch (error) {
            // If check fails, proceed with creating new record
            this.logger.warn('Failed to check for existing search, creating new record:', error);
        }

        // Create new search history record
        await this.client.index({
            index: this.searchHistoryIndexName,
            document: {
                userId: userId || null,
                sessionId: sessionId || null,
                query: params.query || '',
                categoryId: params.categoryId || null,
                locationId: params.locationId || null,
                timestamp: new Date().toISOString(),
                resultCount: params.resultCount,
                clickedResults: params.clickedResults || [],
                dwellTime: params.dwellTime || 0,
                converted: params.converted || false,
                searchCount: 1,
            },
        });
    }

    async getUserSearchHistory(userId: string | undefined, sessionId: string | undefined, limit: number = 50) {
        if (!userId && !sessionId) {
            return [];
        }

        const cacheKey = `search_history_${userId || sessionId}_${limit}`;
        const cached = this.getCached(cacheKey);
        if (cached) {
            return cached;
        }

        const query: any = {
            bool: {
                should: [
                    ...(userId ? [{ term: { userId } }] : []),
                    ...(sessionId ? [{ term: { sessionId } }] : []),
                ],
                minimum_should_match: 1,
            },
        };

        const result = await this.client.search({
            index: this.searchHistoryIndexName,
            size: limit,
            query,
            sort: [{ timestamp: 'desc' }],
        });

        const history = result.hits.hits.map((hit: any) => hit._source);
        this.setCache(cacheKey, history, 1 * 60 * 1000); // Cache for 1 minute
        return history;
    }

    async mergeSessionHistory(sessionId: string, userId: string) {
        // Merge all search history entries from sessionId to userId
        try {
            const sessionHistory = await this.client.search({
                index: this.searchHistoryIndexName,
                size: 1000,
                query: {
                    term: { sessionId },
                },
            });

            if (sessionHistory.hits.hits.length === 0) {
                return { merged: 0 };
            }

            // Update all session history entries to use userId
            const bulkBody = sessionHistory.hits.hits.flatMap((hit: any) => [
                { update: { _index: this.searchHistoryIndexName, _id: hit._id } },
                { doc: { userId, sessionId: null } },
            ]);

            if (bulkBody.length > 0) {
                await this.client.bulk({ refresh: true, body: bulkBody });
            }

            return { merged: sessionHistory.hits.hits.length };
        } catch (error: any) {
            this.logger.error('Failed to merge session history:', error.message);
            return { merged: 0, error: error.message };
        }
    }

    async updateSearchHistory(
        userId: string | undefined,
        sessionId: string | undefined,
        params: {
            query?: string;
            categoryId?: string;
            locationId?: string;
            clickedResults?: string[];
            dwellTime?: number;
            converted?: boolean;
        },
    ) {
        if (!userId && !sessionId) {
            return;
        }

        try {
            // Find the most recent search history entry matching the criteria
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            const query: any = {
                bool: {
                    must: [
                        {
                            range: {
                                timestamp: {
                                    gte: fiveMinutesAgo,
                                },
                            },
                        },
                    ],
                    should: [
                        ...(userId ? [{ term: { userId } }] : []),
                        ...(sessionId ? [{ term: { sessionId } }] : []),
                    ],
                    minimum_should_match: 1,
                },
            };

            // Add query match if provided
            if (params.query) {
                query.bool.must.push({
                    term: { 'query.keyword': params.query },
                });
            }

            // Add category/location match if provided
            if (params.categoryId) {
                query.bool.must.push({ term: { categoryId: params.categoryId } });
            }
            if (params.locationId) {
                query.bool.must.push({ term: { locationId: params.locationId } });
            }

            const result = await this.client.search({
                index: this.searchHistoryIndexName,
                size: 1,
                query,
                sort: [{ timestamp: 'desc' }],
            });

            if (result.hits.hits.length > 0) {
                const hit = result.hits.hits[0];
                const existing = hit._source as any;
                
                // Merge clicked results (avoid duplicates)
                const existingClicked = new Set(existing.clickedResults || []);
                const newClicked = new Set(params.clickedResults || []);
                const mergedClicked = Array.from(new Set([...existingClicked, ...newClicked]));

                // Update the document
                await this.client.update({
                    index: this.searchHistoryIndexName,
                    id: hit._id,
                    doc: {
                        clickedResults: mergedClicked,
                        dwellTime: Math.max(existing.dwellTime || 0, params.dwellTime || 0),
                        converted: params.converted !== undefined ? params.converted : (existing.converted || false),
                    },
                });
            }
        } catch (error: any) {
            this.logger.warn('Failed to update search history with interaction data:', error.message);
        }
    }

    async getPersonalizedRecommendations(userId: string, size: number = 20) {
        try {
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
                // Fallback to popular products if no history
                return this.getPopularProducts(size);
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
                index: this.indexAlias,
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
                isEmpty: result.hits.hits.length === 0,
            };
        } catch (error: any) {
            this.logger.error('Error getting personalized recommendations:', error.message);
            // Fallback to popular products on error
            return this.getPopularProducts(size);
        }
    }

    async getRelatedProducts(postId: string, size: number = 12) {
        try {
            // First, get the post details
            const postResult = await this.client.search({
                index: this.indexAlias,
                size: 1,
                query: {
                    term: { id: postId },
                },
            });

            if (postResult.hits.hits.length === 0) {
                return { hits: [], total: 0 };
            }

            const post = postResult.hits.hits[0]._source as any;
            const categoryId = post?.categoryId;
            const locationId = post?.locationId;
            const price = post?.price || 0;
            const title = post?.title || '';
            const description = post?.description || '';

            // Build query for related products using more_like_this and filters
            const should: any[] = [];
            const filter: any[] = [
                { term: { status: 'ACTIVE' } },
                { bool: { must_not: [{ term: { id: postId } }] } }, // Exclude the current post
            ];

            // Boost by same category
            if (categoryId) {
                should.push({
                    term: {
                        categoryId: {
                            value: categoryId,
                            boost: 3.0,
                        },
                    },
                });
            }

            // Boost by same location
            if (locationId) {
                should.push({
                    term: {
                        locationId: {
                            value: locationId,
                            boost: 2.0,
                        },
                    },
                });
            }

            // Similar price range (±30%)
            if (price > 0) {
                const minPrice = price * 0.7;
                const maxPrice = price * 1.3;
                should.push({
                    range: {
                        price: {
                            gte: minPrice,
                            lte: maxPrice,
                            boost: 1.5,
                        },
                    },
                });
            }

            // Similar title/description using more_like_this
            if (title || description) {
                const likeFields: string[] = [];
                const likeTexts: string[] = [];

                if (title) {
                    likeFields.push('title');
                    likeTexts.push(title);
                }
                if (description) {
                    likeFields.push('description');
                    likeTexts.push(description);
                }

                if (likeFields.length > 0) {
                    should.push({
                        more_like_this: {
                            fields: likeFields,
                            like: likeTexts,
                            min_term_freq: 1,
                            min_doc_freq: 1,
                            max_query_terms: 12,
                            boost: 2.0,
                        },
                    });
                }
            }

            // Execute search
            const result = await this.client.search({
                index: this.indexAlias,
                size,
                query: {
                    bool: {
                        should: should.length > 0 ? should : [{ match_all: {} }],
                        filter,
                        minimum_should_match: should.length > 0 ? 1 : 0,
                    },
                },
                sort: [
                    '_score',
                    { createdAt: 'desc' },
                ],
            });

            return {
                hits: result.hits.hits.map((hit: any) => ({
                    ...hit._source,
                    _related: true,
                })),
                total: typeof result.hits.total === 'number'
                    ? result.hits.total
                    : result.hits.total?.value || 0,
            };
        } catch (error: any) {
            this.logger.error(`Error getting related products for ${postId}:`, error.message);
            // Fallback: return products from same category
            try {
                const postResult = await this.client.search({
                    index: this.indexAlias,
                    size: 1,
                    query: { term: { id: postId } },
                });

                if (postResult.hits.hits.length === 0) {
                    return { hits: [], total: 0 };
                }

                const categoryId = (postResult.hits.hits[0]._source as any)?.categoryId;
                if (!categoryId) {
                    return { hits: [], total: 0 };
                }

                const fallbackResult = await this.client.search({
                    index: this.indexAlias,
                    size,
                    query: {
                        bool: {
                            must: [{ term: { categoryId } }],
                            filter: [
                                { term: { status: 'ACTIVE' } },
                                { bool: { must_not: [{ term: { id: postId } }] } },
                            ],
                        },
                    },
                    sort: [{ createdAt: 'desc' }],
                });

                return {
                    hits: fallbackResult.hits.hits.map((hit: any) => hit._source),
                    total: typeof fallbackResult.hits.total === 'number'
                        ? fallbackResult.hits.total
                        : fallbackResult.hits.total?.value || 0,
                };
            } catch (fallbackError: any) {
                this.logger.error('Fallback related products failed:', fallbackError.message);
                return { hits: [], total: 0 };
            }
        }
    }

    /**
     * Fix Elasticsearch alias to set is_write_index flag
     */
    async fixAliasWriteIndex() {
        try {
            // Get current alias info
            const aliasExists = await this.client.indices.existsAlias({ name: this.indexAlias });
            
            if (!aliasExists) {
                throw new Error(`Alias ${this.indexAlias} does not exist`);
            }

            // Get all indices using this alias
            const currentAliases = await this.client.indices.getAlias({ name: this.indexAlias });
            const indices = Object.keys(currentAliases);

            // Update alias to set is_write_index on the current index
            const actions = indices.map((index) => ({
                add: {
                    index,
                    alias: this.indexAlias,
                    is_write_index: index === this.indexName, // Only current index is writable
                },
            }));

            await this.client.indices.updateAliases({ body: { actions } });

            this.logger.log(`✅ Fixed alias ${this.indexAlias} with is_write_index flag`);

            return {
                success: true,
                message: 'Elasticsearch alias fixed successfully',
                alias: this.indexAlias,
                writeIndex: this.indexName,
            };
        } catch (error: any) {
            this.logger.error('Failed to fix alias:', error.message);
            throw error;
        }
    }

    /**
     * Health check for Elasticsearch
     * Returns status and details about ES connection and indexes
     */
    async getHealth() {
        try {
            // Check ES connection
            const pingResult = await this.client.ping();
            if (!pingResult) {
                return {
                    status: 'unhealthy',
                    elasticsearch: { connected: false },
                    error: 'Elasticsearch ping failed',
                };
            }

            // Get cluster health
            const clusterHealth = await this.client.cluster.health();
            
            // Get ES version info
            const info = await this.client.info();
            
            // Check if index exists
            const indexExists = await this.client.indices.exists({ index: this.indexName });
            const aliasExists = await this.client.indices.existsAlias({ name: this.indexAlias });
            
            let documentCount = 0;
            let mappingValid = false;
            
            if (indexExists) {
                // Get document count
                const stats = await this.client.count({ index: this.indexAlias });
                documentCount = stats.count;
                
                // Verify mapping matches expected
                const mapping = await this.client.indices.getMapping({ index: this.indexName });
                const actualMapping = mapping[this.indexName]?.mappings?.properties;
                mappingValid = actualMapping?.id?.type === 'keyword'; // Basic validation
            }

            return {
                status: clusterHealth.status === 'green' ? 'healthy' : 
                       clusterHealth.status === 'yellow' ? 'degraded' : 'unhealthy',
                elasticsearch: {
                    connected: true,
                    version: info.version?.number || 'unknown',
                    clusterHealth: clusterHealth.status,
                },
                indexes: {
                    [this.indexAlias]: {
                        exists: indexExists,
                        aliasExists,
                        documentCount,
                        mappingValid,
                    },
                },
            };
        } catch (error: any) {
            this.logger.error('Health check failed:', error.message);
            return {
                status: 'unhealthy',
                elasticsearch: { connected: false },
                error: error.message,
            };
        }
    }
}
