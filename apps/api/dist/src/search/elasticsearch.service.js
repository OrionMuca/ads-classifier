"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const elasticsearch_1 = require("@elastic/elasticsearch");
let ElasticsearchService = class ElasticsearchService {
    configService;
    client;
    indexName = 'marketplace_posts_v2';
    searchHistoryIndexName = 'marketplace_search_history';
    constructor(configService) {
        this.configService = configService;
        this.client = new elasticsearch_1.Client({
            node: this.configService.get('ELASTICSEARCH_NODE'),
        });
    }
    async onModuleInit() {
        await this.createIndexIfNotExists();
        await this.createSearchHistoryIndexIfNotExists();
    }
    async createIndexIfNotExists() {
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
                            search_analyzer: 'standard',
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                        description: { type: 'text' },
                        price: { type: 'float' },
                        status: { type: 'keyword' },
                        viewCount: { type: 'integer' },
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
                        locationId: { type: 'keyword' },
                        city: { type: 'keyword' },
                        country: { type: 'keyword' },
                        images: { type: 'keyword' },
                        userId: { type: 'keyword' },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' },
                        suggest: {
                            type: 'completion',
                        },
                    },
                },
            });
        }
    }
    async createSearchHistoryIndexIfNotExists() {
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
    async indexPost(post) {
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
                categoryId: post.categoryId || post.category?.id,
                categoryName: post.category?.name,
                categorySlug: post.category?.slug,
                locationId: post.locationId || post.location?.id,
                city: post.location?.city,
                country: post.location?.country || 'Albania',
                images: post.images,
                userId: post.userId,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
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
    async updatePost(post) {
        await this.indexPost(post);
    }
    async deletePost(postId) {
        await this.client.delete({
            index: this.indexName,
            id: postId,
        });
    }
    async search(params) {
        const must = [];
        const filter = [];
        if (params.query) {
            must.push({
                multi_match: {
                    query: params.query,
                    fields: ['title^3', 'categoryName^2', 'description'],
                    fuzziness: 'AUTO',
                },
            });
        }
        else {
            must.push({ match_all: {} });
        }
        filter.push({ term: { status: 'ACTIVE' } });
        if (params.categoryId) {
            filter.push({ term: { categoryId: params.categoryId } });
        }
        if (params.locationId) {
            filter.push({ term: { locationId: params.locationId } });
        }
        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
            const range = {};
            if (params.minPrice !== undefined)
                range.gte = params.minPrice;
            if (params.maxPrice !== undefined)
                range.lte = params.maxPrice;
            filter.push({ range: { price: range } });
        }
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
                { id: 'desc' },
            ],
            search_after: params.searchAfter,
        });
        return {
            hits: result.hits.hits.map((hit) => ({
                ...hit._source,
                sort: hit.sort,
            })),
            total: typeof result.hits.total === 'number'
                ? result.hits.total
                : result.hits.total?.value || 0,
        };
    }
    async getSuggestions(query) {
        if (!query)
            return [];
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
        const suggestions = result.suggest?.['post_suggest']?.[0]?.options?.map((option) => ({
            text: option.text,
            score: option._score,
        })) || [];
        return suggestions;
    }
    async reindexAll(posts) {
        const indexExists = await this.client.indices.exists({ index: this.indexName });
        if (indexExists) {
            await this.client.indices.delete({ index: this.indexName });
        }
        await this.createIndexIfNotExists();
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
    async recordSearch(userId, params) {
        if (!userId)
            return;
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
    async getUserSearchHistory(userId, limit = 50) {
        const result = await this.client.search({
            index: this.searchHistoryIndexName,
            size: limit,
            query: {
                term: { userId },
            },
            sort: [{ timestamp: 'desc' }],
        });
        return result.hits.hits.map((hit) => hit._source);
    }
    async getPersonalizedRecommendations(userId, size = 20) {
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
        const searchHistory = historyResult.hits.hits.map((hit) => hit._source);
        if (searchHistory.length === 0) {
            return { hits: [], total: 0 };
        }
        const categoryCount = {};
        searchHistory.forEach((search) => {
            if (search.categoryId) {
                categoryCount[search.categoryId] = (categoryCount[search.categoryId] || 0) + 1;
            }
        });
        const topCategories = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([categoryId]) => categoryId);
        if (topCategories.length === 0) {
            return this.search({ size });
        }
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
            hits: result.hits.hits.map((hit) => ({
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
};
exports.ElasticsearchService = ElasticsearchService;
exports.ElasticsearchService = ElasticsearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ElasticsearchService);
//# sourceMappingURL=elasticsearch.service.js.map