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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const elasticsearch_service_1 = require("../search/elasticsearch.service");
let PostsService = class PostsService {
    prisma;
    elasticsearchService;
    constructor(prisma, elasticsearchService) {
        this.prisma = prisma;
        this.elasticsearchService = elasticsearchService;
    }
    async create(createPostDto, userId) {
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
            },
        });
        await this.elasticsearchService.indexPost(post);
        return post;
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                skip,
                take: limit,
                where: { status: 'ACTIVE' },
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
    async findOne(id) {
        return this.prisma.post.findUnique({
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
            },
        });
    }
    async findByUserId(userId) {
        return this.prisma.post.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async update(id, updatePostDto, userId) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post || post.userId !== userId) {
            throw new Error('Unauthorized');
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
            },
        });
        await this.elasticsearchService.updatePost(updatedPost);
        return updatedPost;
    }
    async remove(id, userId) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post || post.userId !== userId) {
            throw new Error('Unauthorized');
        }
        await this.prisma.post.delete({ where: { id } });
        await this.elasticsearchService.deletePost(id);
        return { message: 'Post deleted successfully' };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        elasticsearch_service_1.ElasticsearchService])
], PostsService);
//# sourceMappingURL=posts.service.js.map