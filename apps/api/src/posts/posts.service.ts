import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchService } from '../search/elasticsearch.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { ModerationService } from '../moderation/moderation.service';
import { ImageModerationService } from '../moderation/image-moderation.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PostsService {
    constructor(
        private prisma: PrismaService,
        private elasticsearchService: ElasticsearchService,
        private moderationService: ModerationService,
        private imageModerationService: ImageModerationService,
        private subscriptionService: SubscriptionService,
    ) { }

    async create(createPostDto: CreatePostDto, userId: string) {
        const postLimitCheck = await this.subscriptionService.checkPostLimit(userId);
        if (!postLimitCheck.allowed) {
            throw new BadRequestException(postLimitCheck.reason);
        }

        const imageLimitCheck = await this.subscriptionService.checkImageLimit(
            userId,
            createPostDto.images?.length || 0,
        );
        if (!imageLimitCheck.allowed) {
            throw new BadRequestException(imageLimitCheck.reason);
        }

        const titleWords = await this.moderationService.getBlacklistedWordsInText(
            createPostDto.title,
        );
        const descriptionWords = await this.moderationService.getBlacklistedWordsInText(
            createPostDto.description,
        );

        if (titleWords.length > 0 || descriptionWords.length > 0) {
            throw new BadRequestException(
                'Postimi përmban fjalë të ndaluara. Ju lutemi hiqni këto fjalë dhe provoni përsëri.',
            );
        }

        // Validate images for NSFW content (if enabled)
        if (createPostDto.images && createPostDto.images.length > 0) {
            const blockedImages = await this.imageModerationService.validateImages(
                createPostDto.images,
            );

            if (blockedImages.length > 0) {
                throw new BadRequestException(
                    'Një ose më shumë foto nuk janë të lejuara. Ju lutemi zgjidhni foto të tjera.',
                );
            }
        }

        const post = await this.prisma.post.create({
            data: {
                ...createPostDto,
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
                location: true,
                zone: true,
            },
        });

        try {
            await this.elasticsearchService.indexPost(post);
        } catch (error) {
            console.error(`Failed to index post ${post.id} in Elasticsearch:`, error);
        }

        return post;
    }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                skip,
                take: limit,
                where: {
                    status: 'ACTIVE', 
                    user: {
                        isActive: true,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    category: true,
                    location: true,
                },
            }),
            this.prisma.post.count({
                where: {
                    status: 'ACTIVE',
                    user: {
                        isActive: true,
                    },
                },
            }),
        ]);

        return {
            posts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    category: true,
                    location: true,
                    zone: true,
                },
            });

            if (!post) {
                throw new NotFoundException(`Post with ID ${id} not found`);
            }

            return post;
        } catch (error) {
            // Log the error for debugging
            console.error(`Error fetching post ${id}:`, error);
            throw error;
        }
    }

    async findByUserId(userId: string) {
        return this.prisma.post.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
        // Verify post exists
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        // Verify ownership
        if (post.userId !== userId) {
            throw new ForbiddenException('You do not have permission to update this post');
        }

        // Check image limit if images are being updated
        if (updatePostDto.images && updatePostDto.images.length > 0) {
            const imageLimitCheck = await this.subscriptionService.checkImageLimit(
                userId,
                updatePostDto.images.length,
            );
            if (!imageLimitCheck.allowed) {
                throw new BadRequestException(imageLimitCheck.reason);
            }
        }

        // Validate text content for blacklisted words (if provided)
        if (updatePostDto.title) {
            const titleWords = await this.moderationService.getBlacklistedWordsInText(
                updatePostDto.title,
            );
            if (titleWords.length > 0) {
                throw new BadRequestException(
                    'Titulli përmban fjalë të ndaluara. Ju lutemi hiqni këto fjalë dhe provoni përsëri.',
                );
            }
        }

        if (updatePostDto.description) {
            const descriptionWords = await this.moderationService.getBlacklistedWordsInText(
                updatePostDto.description,
            );
            if (descriptionWords.length > 0) {
                throw new BadRequestException(
                    'Përshkrimi përmban fjalë të ndaluara. Ju lutemi hiqni këto fjalë dhe provoni përsëri.',
                );
            }
        }

        // Validate images for NSFW content (if provided)
        if (updatePostDto.images && updatePostDto.images.length > 0) {
            const blockedImages = await this.imageModerationService.validateImages(
                updatePostDto.images,
            );

            if (blockedImages.length > 0) {
                throw new BadRequestException(
                    'Një ose më shumë foto nuk janë të lejuara. Ju lutemi zgjidhni foto të tjera.',
                );
            }
        }

        const updatedPost = await this.prisma.post.update({
            where: { id },
            data: updatePostDto,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
                location: true,
                zone: true,
            },
        });

        // Update in Elasticsearch (non-blocking)
        try {
            await this.elasticsearchService.updatePost(updatedPost);
        } catch (error) {
            console.error(`Failed to update post ${updatedPost.id} in Elasticsearch:`, error);
            // Post is still updated in database, can be synced later
        }

        return updatedPost;
    }

    async remove(id: string, userId: string) {
        // Verify post exists
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        // Verify ownership
        if (post.userId !== userId) {
            throw new ForbiddenException('You do not have permission to delete this post');
        }

        await this.prisma.post.delete({ where: { id } });

        // Delete from Elasticsearch (non-blocking)
        try {
            await this.elasticsearchService.deletePost(id);
        } catch (error) {
            console.error(`Failed to delete post ${id} from Elasticsearch:`, error);
            // Post is still deleted from database
        }

        return { message: 'Post deleted successfully' };
    }
}
