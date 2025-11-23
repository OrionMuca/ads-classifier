import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchService } from '../search/elasticsearch.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
    constructor(
        private prisma: PrismaService,
        private elasticsearchService: ElasticsearchService,
    ) { }

    async create(createPostDto: CreatePostDto, userId: string) {
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

        // Index in Elasticsearch
        await this.elasticsearchService.indexPost(post);

        return post;
    }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                skip,
                take: limit,
                where: { status: 'ACTIVE' }, // Only show active posts by default
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
            this.prisma.post.count({ where: { status: 'ACTIVE' } }),
        ]);

        return {
            posts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
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

        // Update in Elasticsearch
        await this.elasticsearchService.updatePost(updatedPost);

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

        // Delete from Elasticsearch
        await this.elasticsearchService.deletePost(id);

        return { message: 'Post deleted successfully' };
    }
}
