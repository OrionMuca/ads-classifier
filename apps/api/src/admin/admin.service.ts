import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchService } from '../search/elasticsearch.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private elasticsearchService: ElasticsearchService,
    ) { }

    // User Management
    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }

    async deleteUser(userId: string) {
        return this.prisma.user.delete({
            where: { id: userId },
        });
    }

    // Post Management
    async getAllPosts(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    category: { select: { name: true } },
                    location: { select: { city: true } },
                },
            }),
            this.prisma.post.count(),
        ]);

        return {
            posts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async deletePost(postId: string) {
        await this.prisma.post.delete({
            where: { id: postId },
        });

        // Also remove from Elasticsearch
        await this.elasticsearchService.deletePost(postId);

        return { message: 'Post deleted successfully' };
    }

    // Statistics
    async getStats() {
        const [totalUsers, totalPosts, recentPosts] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.post.count(),
            this.prisma.post.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
            }),
        ]);

        // Posts by category
        const postsByCategory = await this.prisma.post.groupBy({
            by: ['categoryId'],
            _count: true,
        });

        // Get category names
        const categories = await this.prisma.category.findMany({
            select: { id: true, name: true },
        });

        const categoryMap = new Map(categories.map(c => [c.id, c.name]));

        const postsByCategoryWithNames = postsByCategory.map(item => ({
            category: categoryMap.get(item.categoryId) || 'Unknown',
            count: item._count,
        }));

        return {
            totalUsers,
            totalPosts,
            recentPosts,
            postsByCategory: postsByCategoryWithNames,
        };
    }

    // Elasticsearch Reindexing
    async reindexAllPosts() {
        const posts = await this.prisma.post.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                category: true,
                location: true,
            },
        });

        let indexed = 0;
        for (const post of posts) {
            await this.elasticsearchService.indexPost(post);
            indexed++;
        }

        return {
            message: 'Reindexing complete',
            totalIndexed: indexed,
        };
    }

    // Categories Management
    async getAllCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    // Locations Management
    async getAllLocations() {
        return this.prisma.location.findMany({
            orderBy: { weight: 'desc' },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }
}
