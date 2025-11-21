import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';

@Injectable()
export class SearchService {
    constructor(private elasticsearchService: ElasticsearchService) { }

    async search(params: {
        query?: string;
        category?: string;
        city?: string;
        minPrice?: number;
        maxPrice?: number;
        searchAfter?: any[];
        size?: number;
        userCity?: string;
    }) {
        return this.elasticsearchService.search(params);
    }
}
