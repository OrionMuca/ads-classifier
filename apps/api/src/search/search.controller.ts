import { Controller, Get, Post, Query, Param, UseGuards, Headers, Body, BadRequestException } from '@nestjs/common';
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
        @Query('sortBy') sortBy?: string,
        @CurrentUser() user?: any,
        @Headers('x-session-id') sessionId?: string,
    ) {
        let parsedMinPrice = minPrice !== undefined ? parseFloat(minPrice) : undefined;
        let parsedMaxPrice = maxPrice !== undefined ? parseFloat(maxPrice) : undefined;

        if (parsedMinPrice !== undefined) {
            if (Number.isNaN(parsedMinPrice)) {
                throw new BadRequestException('minPrice must be a valid number');
            }
            if (parsedMinPrice < 0) {
                throw new BadRequestException('minPrice cannot be negative');
            }
        }

        if (parsedMaxPrice !== undefined) {
            if (Number.isNaN(parsedMaxPrice)) {
                throw new BadRequestException('maxPrice must be a valid number');
            }
            if (parsedMaxPrice < 0) {
                throw new BadRequestException('maxPrice cannot be negative');
            }
        }

        if (
            parsedMinPrice !== undefined &&
            parsedMaxPrice !== undefined &&
            parsedMinPrice > parsedMaxPrice
        ) {
            // Swap values so the request still succeeds
            [parsedMinPrice, parsedMaxPrice] = [parsedMaxPrice, parsedMinPrice];
        }

        const result = await this.elasticsearchService.search({
            query,
            categoryId,
            locationId,
            minPrice: parsedMinPrice,
            maxPrice: parsedMaxPrice,
            searchAfter: searchAfter ? JSON.parse(searchAfter) : undefined,
            size: size ? parseInt(size) : 20,
            sortBy: sortBy as 'newest' | 'price-low' | 'price-high' | 'popular' | undefined,
        });

        // Track search for authenticated users and anonymous users
        await this.elasticsearchService.recordSearch(
            user?.userId,
            sessionId,
            {
                query,
                categoryId,
                locationId,
                resultCount: result.total,
            }
        );

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
    async getSearchHistory(
        @CurrentUser() user?: any,
        @Headers('x-session-id') sessionId?: string,
        @Query('limit') limit?: string,
    ) {
        return this.elasticsearchService.getUserSearchHistory(
            user?.userId,
            sessionId,
            limit ? parseInt(limit) : 50,
        );
    }

    @Get('suggest')
    async suggest(
        @Query('query') query: string,
        @CurrentUser() user?: any,
        @Headers('x-session-id') sessionId?: string,
    ) {
        return this.elasticsearchService.getSuggestions(query || '', user?.userId, sessionId);
    }

    @Get('trending')
    async getTrendingSearches(@Query('limit') limit?: string) {
        return this.elasticsearchService.getTrendingSearches(limit ? parseInt(limit) : 10);
    }

    @Get('popular')
    async getPopularProducts(@Query('size') size?: string) {
        return this.elasticsearchService.getPopularProducts(size ? parseInt(size) : 20);
    }

    @Get('trending-products')
    async getTrendingProducts(@Query('size') size?: string) {
        return this.elasticsearchService.getTrendingProducts(size ? parseInt(size) : 8);
    }

    @Get('related/:postId')
    async getRelatedProducts(
        @Param('postId') postId: string,
        @Query('size') size?: string,
    ) {
        return this.elasticsearchService.getRelatedProducts(postId, size ? parseInt(size) : 12);
    }

    @Get('debug')
    async debugSearch(
        @Query('categoryId') categoryId?: string,
    ) {
        // Diagnostic endpoint to check index status
        try {
            const indexAlias = 'marketplace_posts';
            
            // Check if index exists and get document count
            const indexExists = await this.elasticsearchService['client'].indices.exists({ 
                index: indexAlias 
            });
            
            if (!indexExists) {
                return { 
                    error: 'Index does not exist',
                    indexAlias,
                    suggestion: 'Run reindex endpoint to create index and populate data'
                };
            }

            // Get total document count
            const countResult = await this.elasticsearchService['client'].count({ 
                index: indexAlias 
            });

            // Get sample documents
            const sampleResult = await this.elasticsearchService['client'].search({
                index: indexAlias,
                size: 5,
                query: { match_all: {} }
            });

            // Check categoryId if provided
            let categoryCheck: any = null;
            if (categoryId) {
                const categoryResult = await this.elasticsearchService['client'].search({
                    index: indexAlias,
                    size: 0,
                    query: {
                        bool: {
                            filter: [
                                { term: { categoryId } },
                                { term: { status: 'ACTIVE' } }
                            ]
                        }
                    }
                });
                categoryCheck = {
                    categoryId,
                    count: typeof categoryResult.hits.total === 'number' 
                        ? categoryResult.hits.total 
                        : categoryResult.hits.total?.value || 0
                };
            }

            return {
                indexExists: true,
                indexAlias,
                totalDocuments: countResult.count,
                sampleDocuments: sampleResult.hits.hits.map((hit: any) => ({
                    id: hit._source.id,
                    title: hit._source.title,
                    categoryId: hit._source.categoryId,
                    categoryName: hit._source.categoryName,
                    status: hit._source.status,
                })),
                categoryCheck,
            };
        } catch (error: any) {
            return {
                error: error.message,
                stack: error.stack,
            };
        }
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
                zone: true,
            },
        });

        return this.elasticsearchService.reindexAll(posts);
    }

    @Post('merge-session')
    @UseGuards(JwtAuthGuard)
    async mergeSession(
        @CurrentUser() user: any,
        @Headers('x-session-id') sessionId?: string,
    ) {
        if (!sessionId) {
            return { merged: 0, error: 'Session ID not provided' };
        }
        return this.elasticsearchService.mergeSessionHistory(sessionId, user.userId);
    }

    @Post('interaction')
    async recordInteraction(
        @CurrentUser() user?: any,
        @Headers('x-session-id') sessionId?: string,
        @Body() body?: {
            query?: string;
            categoryId?: string;
            locationId?: string;
            clickedResults?: string[];
            dwellTime?: number;
        },
    ) {
        if (!body) {
            return { success: false, error: 'No interaction data provided' };
        }

        // Update the most recent search history entry with interaction data
        try {
            await this.elasticsearchService.updateSearchHistory(
                user?.userId,
                sessionId,
                {
                    query: body.query,
                    categoryId: body.categoryId,
                    locationId: body.locationId,
                    clickedResults: body.clickedResults || [],
                    dwellTime: body.dwellTime || 0,
                    converted: (body.clickedResults?.length || 0) > 0,
                },
            );
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}
