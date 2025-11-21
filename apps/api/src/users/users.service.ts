import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // Profile Management
    async getProfile(userId: string) {
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
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const { whatsapp, instagram, bio, avatar, ...userData } = dto;

        // Update user data
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

    // Posts Management
    async getUserPosts(userId: string, page: number = 1, limit: number = 20) {
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

    // Saved Posts Management
    async getSavedPosts(userId: string, page: number = 1, limit: number = 20) {
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

    async savePost(userId: string, postId: string) {
        // Check if post exists
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Check if already saved
        const existing = await this.prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existing) {
            throw new BadRequestException('Post already saved');
        }

        // Save the post
        await this.prisma.savedPost.create({
            data: {
                userId,
                postId,
            },
        });

        return { message: 'Post saved successfully' };
    }

    async unsavePost(userId: string, postId: string) {
        const savedPost = await this.prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (!savedPost) {
            throw new NotFoundException('Saved post not found');
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

    async isPostSaved(userId: string, postId: string) {
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
}
