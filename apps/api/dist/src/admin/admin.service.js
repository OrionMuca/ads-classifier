"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const elasticsearch_service_1 = require("../search/elasticsearch.service");
let AdminService = class AdminService {
    prisma;
    elasticsearchService;
    constructor(prisma, elasticsearchService) {
        this.prisma = prisma;
        this.elasticsearchService = elasticsearchService;
    }
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
    async updateUserRole(userId, role) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }
    async deleteUser(userId) {
        return this.prisma.user.delete({
            where: { id: userId },
        });
    }
    async getAllPosts(page = 1, limit = 20) {
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
    async deletePost(postId) {
        await this.prisma.post.delete({
            where: { id: postId },
        });
        await this.elasticsearchService.deletePost(postId);
        return { message: 'Post deleted successfully' };
    }
    async getStats() {
        const [totalUsers, totalPosts, recentPosts] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.post.count(),
            this.prisma.post.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        const postsByCategory = await this.prisma.post.groupBy({
            by: ['categoryId'],
            _count: true,
        });
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        elasticsearch_service_1.ElasticsearchService])
], AdminService);
//# sourceMappingURL=admin.service.js.map