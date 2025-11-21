import { ElasticsearchService } from './elasticsearch.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class SearchController {
    private readonly elasticsearchService;
    private readonly prisma;
    constructor(elasticsearchService: ElasticsearchService, prisma: PrismaService);
    search(query?: string, categoryId?: string, locationId?: string, minPrice?: string, maxPrice?: string, searchAfter?: string, size?: string, user?: any): Promise<{
        hits: any[];
        total: number;
    }>;
    getRecommendations(user: any, size?: string): Promise<{
        hits: any[];
        total: number;
    } | {
        hits: any[];
        total: number;
        topCategories: string[];
    }>;
    getSearchHistory(user: any, limit?: string): Promise<any[]>;
    suggest(query: string): Promise<any>;
    reindex(user: any): Promise<{
        count: number;
        errors: boolean;
    }>;
}
