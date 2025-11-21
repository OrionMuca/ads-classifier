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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                createdAt: true,
                profile: {
                    select: {
                        whatsapp: true,
                        instagram: true,
                        bio: true,
                    },
                },
                _count: {
                    select: {
                        posts: true,
                        savedPosts: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, dto) {
        const { whatsapp, instagram, bio, avatar, ...userData } = dto;
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...userData,
                ...(avatar && { avatar }),
                profile: {
                    upsert: {
                        create: {
                            whatsapp,
                            instagram,
                            bio,
                        },
                        update: {
                            ...(whatsapp !== undefined && { whatsapp }),
                            ...(instagram !== undefined && { instagram }),
                            ...(bio !== undefined && { bio }),
                        },
                    },
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                profile: {
                    select: {
                        whatsapp: true,
                        instagram: true,
                        bio: true,
                    },
                },
            },
        });
        return user;
    }
    async getUserPosts(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: { select: { name: true, icon: true } },
                    location: { select: { city: true } },
                },
            }),
            this.prisma.post.count({ where: { userId } }),
        ]);
        return {
            posts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSavedPosts(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [savedPosts, total] = await Promise.all([
            this.prisma.savedPost.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    post: {
                        include: {
                            category: { select: { name: true, icon: true } },
                            location: { select: { city: true } },
                            user: { select: { id: true, name: true, email: true } },
                        },
                    },
                },
            }),
            this.prisma.savedPost.count({ where: { userId } }),
        ]);
        return {
            posts: savedPosts.map((sp) => sp.post),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async savePost(userId, postId) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const existing = await this.prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Post already saved');
        }
        await this.prisma.savedPost.create({
            data: {
                userId,
                postId,
            },
        });
        return { message: 'Post saved successfully' };
    }
    async unsavePost(userId, postId) {
        const savedPost = await this.prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        if (!savedPost) {
            throw new common_1.NotFoundException('Saved post not found');
        }
        await this.prisma.savedPost.delete({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        return { message: 'Post unsaved successfully' };
    }
    async isPostSaved(userId, postId) {
        const savedPost = await this.prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        return { isSaved: !!savedPost };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map