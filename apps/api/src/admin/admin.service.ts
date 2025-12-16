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
    async getAllUsers(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
            }),
            this.prisma.user.count(),
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
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

    async deactivateUser(userId: string, reason?: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                deactivatedAt: new Date(),
            },
        });
    }

    async reactivateUser(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: true,
                deactivatedAt: null,
            },
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
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Basic counts
        const [
            totalUsers,
            activeUsers,
            totalPosts,
            recentPosts7d,
            recentPosts30d,
            recentUsers7d,
            recentUsers30d,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.post.count(),
            this.prisma.post.count({
                where: { createdAt: { gte: sevenDaysAgo } },
            }),
            this.prisma.post.count({
                where: { createdAt: { gte: thirtyDaysAgo } },
            }),
            this.prisma.user.count({
                where: { createdAt: { gte: sevenDaysAgo } },
            }),
            this.prisma.user.count({
                where: { createdAt: { gte: thirtyDaysAgo } },
            }),
        ]);

        // Posts by status
        const postsByStatus = await this.prisma.post.groupBy({
            by: ['status'],
            _count: true,
        });

        const statusCounts = {
            ACTIVE: 0,
            SOLD: 0,
            HIDDEN: 0,
            DELETED: 0,
        };

        postsByStatus.forEach((item) => {
            statusCounts[item.status] = item._count;
        });

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

        const postsByCategoryWithNames = postsByCategory
            .map(item => ({
                category: categoryMap.get(item.categoryId) || 'Unknown',
                count: item._count,
            }))
            .sort((a, b) => b.count - a.count);

        // Posts by location (top 5)
        const postsByLocation = await this.prisma.post.groupBy({
            by: ['locationId'],
            _count: true,
        });

        const locations = await this.prisma.location.findMany({
            select: { id: true, city: true, country: true },
        });

        const locationMap = new Map(
            locations.map(l => [l.id, `${l.city}, ${l.country}`])
        );

        const postsByLocationWithNames = postsByLocation
            .map(item => ({
                location: locationMap.get(item.locationId) || 'Unknown',
                count: item._count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Total views and average price
        const [totalViews, priceStats] = await Promise.all([
            this.prisma.post.aggregate({
                _sum: { viewCount: true },
            }),
            this.prisma.post.aggregate({
                _avg: { price: true },
                _min: { price: true },
                _max: { price: true },
            }),
        ]);

        // Subscription statistics
        const [totalSubscriptions, activeSubscriptions, subscriptionBreakdown] = await Promise.all([
            this.prisma.subscriptionHistory.count(),
            this.prisma.user.count({
                where: {
                    subscriptionStatus: 'ACTIVE',
                    subscription: { not: 'FREE' },
                },
            }),
            this.prisma.user.groupBy({
                by: ['subscription'],
                _count: true,
            }),
        ]);

        const subscriptionCounts = {
            FREE: 0,
            BASIC: 0,
            PREMIUM: 0,
        };

        subscriptionBreakdown.forEach((item) => {
            subscriptionCounts[item.subscription] = item._count;
        });

        // Total conversations and messages
        const [totalConversations, totalMessages] = await Promise.all([
            this.prisma.conversation.count(),
            this.prisma.message.count(),
        ]);

        return {
            // User stats
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            recentUsers7d,
            recentUsers30d,
            
            // Post stats
            totalPosts,
            recentPosts7d,
            recentPosts30d,
            postsByStatus: statusCounts,
            totalViews: totalViews._sum.viewCount || 0,
            averagePrice: priceStats._avg.price ? Number(priceStats._avg.price) : 0,
            minPrice: priceStats._min.price ? Number(priceStats._min.price) : 0,
            maxPrice: priceStats._max.price ? Number(priceStats._max.price) : 0,
            
            // Category and location stats
            postsByCategory: postsByCategoryWithNames,
            postsByLocation: postsByLocationWithNames,
            
            // Subscription stats
            totalSubscriptions,
            activeSubscriptions,
            subscriptionBreakdown: subscriptionCounts,
            
            // Communication stats
            totalConversations,
            totalMessages,
        };
    }

    // Elasticsearch Health Check
    async getElasticsearchHealth() {
        return this.elasticsearchService.getHealth();
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
                        isActive: true,
                    },
                },
                category: true,
                location: true,
                zone: true,
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

    async fixElasticsearchAlias() {
        return this.elasticsearchService.fixAliasWriteIndex();
    }

    // Categories Management
    async getAllCategories(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    parent: { select: { id: true, name: true } },
                    children: { select: { id: true, name: true } },
                    _count: {
                        select: { posts: true },
                    },
                },
            }),
            this.prisma.category.count(),
        ]);

        return {
            categories,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async createCategory(data: { name: string; slug: string; icon?: string; description?: string; parentId?: string }) {
        return this.prisma.category.create({
            data,
            include: {
                parent: { select: { id: true, name: true } },
                children: { select: { id: true, name: true } },
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async updateCategory(id: string, data: { name?: string; slug?: string; icon?: string; description?: string; parentId?: string | null }) {
        return this.prisma.category.update({
            where: { id },
            data,
            include: {
                parent: { select: { id: true, name: true } },
                children: { select: { id: true, name: true } },
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async deleteCategory(id: string) {
        // Check if category has posts
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: { select: { posts: true } },
                children: true,
            },
        });

        if (!category) {
            throw new Error('Category not found');
        }

        if (category._count.posts > 0) {
            throw new Error('Cannot delete category with existing posts');
        }

        if (category.children.length > 0) {
            throw new Error('Cannot delete category with subcategories. Delete subcategories first.');
        }

        return this.prisma.category.delete({
            where: { id },
        });
    }

    // Locations Management
    async getAllLocations(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [locations, total] = await Promise.all([
            this.prisma.location.findMany({
                skip,
                take: limit,
                orderBy: { weight: 'desc' },
                include: {
                    _count: {
                        select: { posts: true },
                    },
                },
            }),
            this.prisma.location.count(),
        ]);

        return {
            locations,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async createLocation(data: { city: string; state?: string; country?: string; latitude?: number; longitude?: number; weight?: number; hasZones?: boolean }) {
        return this.prisma.location.create({
            data: {
                city: data.city,
                state: data.state,
                country: data.country || 'Albania',
                latitude: data.latitude,
                longitude: data.longitude,
                weight: data.weight ?? 0,
                hasZones: data.hasZones ?? false,
            },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async updateLocation(id: string, data: { city?: string; state?: string; country?: string; latitude?: number; longitude?: number; weight?: number; hasZones?: boolean }) {
        return this.prisma.location.update({
            where: { id },
            data,
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async deleteLocation(id: string) {
        // Check if location has posts
        const location = await this.prisma.location.findUnique({
            where: { id },
            include: {
                _count: { select: { posts: true } },
                zones: true,
            },
        });

        if (!location) {
            throw new Error('Location not found');
        }

        if (location._count.posts > 0) {
            throw new Error('Cannot delete location with existing posts');
        }

        if (location.zones.length > 0) {
            throw new Error('Cannot delete location with zones. Delete zones first.');
        }

        return this.prisma.location.delete({
            where: { id },
        });
    }

    // Zones Management
    async getAllZones(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [zones, total] = await Promise.all([
            this.prisma.zone.findMany({
                skip,
                take: limit,
                include: {
                    location: {
                        select: {
                            id: true,
                            city: true,
                            country: true,
                        },
                    },
                    _count: {
                        select: { posts: true },
                    },
                },
                orderBy: [
                    { location: { weight: 'desc' } },
                    { name: 'asc' },
                ],
            }),
            this.prisma.zone.count(),
        ]);

        return {
            zones,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async createZone(data: { name: string; locationId: string }) {
        return this.prisma.zone.create({
            data,
            include: {
                location: {
                    select: {
                        id: true,
                        city: true,
                        country: true,
                    },
                },
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async updateZone(id: string, data: { name?: string; locationId?: string }) {
        return this.prisma.zone.update({
            where: { id },
            data,
            include: {
                location: {
                    select: {
                        id: true,
                        city: true,
                        country: true,
                    },
                },
                _count: {
                    select: { posts: true },
                },
            },
        });
    }

    async deleteZone(id: string) {
        // Check if zone has posts
        const zone = await this.prisma.zone.findUnique({
            where: { id },
            include: {
                _count: { select: { posts: true } },
            },
        });

        if (!zone) {
            throw new Error('Zone not found');
        }

        if (zone._count.posts > 0) {
            throw new Error('Cannot delete zone with existing posts');
        }

        return this.prisma.zone.delete({
            where: { id },
        });
    }

    // Ads Management (with pagination)
    async getAllAds(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [ads, total] = await Promise.all([
            this.prisma.ad.findMany({
                skip,
                take: limit,
                orderBy: [
                    { position: 'asc' },
                    { createdAt: 'desc' },
                ],
            }),
            this.prisma.ad.count(),
        ]);

        return {
            ads,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
}
