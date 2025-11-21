import { ElasticsearchService } from './elasticsearch.service';
export declare class SearchService {
    private elasticsearchService;
    constructor(elasticsearchService: ElasticsearchService);
    search(params: {
        query?: string;
        category?: string;
        city?: string;
        minPrice?: number;
        maxPrice?: number;
        searchAfter?: any[];
        size?: number;
        userCity?: string;
    }): Promise<{
        hits: any[];
        total: number;
    }>;
}
