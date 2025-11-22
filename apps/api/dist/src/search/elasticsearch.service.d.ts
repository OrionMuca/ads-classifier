import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class ElasticsearchService implements OnModuleInit {
    private configService;
    private client;
    private readonly indexName;
    private readonly searchHistoryIndexName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private createIndexIfNotExists;
    private createSearchHistoryIndexIfNotExists;
    indexPost(post: any): Promise<void>;
    updatePost(post: any): Promise<void>;
    deletePost(postId: string): Promise<void>;
    search(params: {
        query?: string;
        categoryId?: string;
        locationId?: string;
        minPrice?: number;
        maxPrice?: number;
        searchAfter?: any[];
        size?: number;
        userCity?: string;
    }): Promise<{
        hits: any[];
        total: number;
    }>;
    getSuggestions(query: string, userId?: string): Promise<any[]>;
    private calculateSimilarity;
    getTrendingSearches(limit?: number): Promise<any>;
    getPopularProducts(size?: number): Promise<{
        hits: any[];
        total: number;
    }>;
    reindexAll(posts: any[]): Promise<{
        count: number;
        errors: boolean;
    }>;
    recordSearch(userId: string, params: {
        query?: string;
        categoryId?: string;
        locationId?: string;
        resultCount: number;
    }): Promise<void>;
    getUserSearchHistory(userId: string, limit?: number): Promise<any[]>;
    getPersonalizedRecommendations(userId: string, size?: number): Promise<{
        hits: any[];
        total: number;
    } | {
        hits: any[];
        total: number;
        topCategories: string[];
    }>;
}
