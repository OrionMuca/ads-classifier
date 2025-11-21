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
        await this.createIndexIfNotExists();
        await this.createSearchHistoryIndexIfNotExists();
    }

    private async createIndexIfNotExists() {
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
    }

    private async createSearchHistoryIndexIfNotExists() {
        const exists = await this.client.indices.exists({ index: this.searchHistoryIndexName });

        if (!exists) {
            await this.client.indices.create({
                index: this.searchHistoryIndexName,
                mappings: {
                    properties: {
                        userId: { type: 'keyword' },
                        query: { type: 'text' },
                        categoryId: { type: 'keyword' },
                        locationId: { type: 'keyword' },
                        timestamp: { type: 'date' },
                        resultCount: { type: 'integer' },
                    },
                },
            });
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

        // Execute search with createdAt sort (not _id)
        const result = await this.client.search({
            index: this.indexName,
            size: params.size || 20,
            query: {
                bool: {
                    must,
                    filter,
                },
            },
            sort: [
                { createdAt: 'desc' },
                { id: 'desc' }, // Use the id keyword field, not _id metadata
            ],
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

    async getSuggestions(query: string) {
        if (!query) return [];

        const result = await this.client.search({
            index: this.indexName,
            body: {
                suggest: {
                    post_suggest: {
                        prefix: query,
                        completion: {
                            field: 'suggest',
                            skip_duplicates: true,
                            size: 5,
                        },
                    },
                },
            },
        });

        const suggestions = (result.suggest?.['post_suggest'] as any)?.[0]?.options?.map((option: any) => ({
            text: option.text,
            score: option._score,
        })) || [];

        return suggestions;
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
