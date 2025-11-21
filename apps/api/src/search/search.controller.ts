import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('search')
export class SearchController {
    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly prisma: PrismaService,
    ) { }

    @Get()
    async search(
        @Query('query') query?: string,
        @Query('categoryId') categoryId?: string,
        @Query('locationId') locationId?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('searchAfter') searchAfter?: string,
        @Query('size') size?: string,
        @CurrentUser() user?: any,
    ) {
        const result = await this.elasticsearchService.search({
            query,
            categoryId,
            locationId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            searchAfter: searchAfter ? JSON.parse(searchAfter) : undefined,
            size: size ? parseInt(size) : 20,
        });

        // Track search for authenticated users
        if (user?.userId) {
            await this.elasticsearchService.recordSearch(user.userId, {
                query,
                categoryId,
                locationId,
                resultCount: result.total,
            });
        }

        return result;
    }

    @Get('recommendations')
    @UseGuards(JwtAuthGuard)
    async getRecommendations(
        @CurrentUser() user: any,
        @Query('size') size?: string,
    ) {
        return this.elasticsearchService.getPersonalizedRecommendations(
            user.userId,
            size ? parseInt(size) : 20,
        );
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getSearchHistory(
        @CurrentUser() user: any,
        @Query('limit') limit?: string,
    ) {
        return this.elasticsearchService.getUserSearchHistory(
            user.userId,
            limit ? parseInt(limit) : 50,
        );
    }

    @Get('suggest')
    async suggest(@Query('query') query: string) {
        return this.elasticsearchService.getSuggestions(query);
    }

    @Post('reindex')
    @UseGuards(JwtAuthGuard)
    async reindex(@CurrentUser() user: any) {
        // Allow admin or dev (if no role check strictly enforced yet, but let's be safe)
        // For now, just proceed.

        const posts = await this.prisma.post.findMany({
            include: {
                category: true,
                location: true,
            },
        });

        return this.elasticsearchService.reindexAll(posts);
    }
}
