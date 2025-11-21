import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        _count: {
            posts: number;
            savedPosts: number;
        };
        name: string | null;
        email: string;
        phone: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        profile: {
            whatsapp: string | null;
            instagram: string | null;
            bio: string | null;
        } | null;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string | null;
        email: string;
        phone: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        profile: {
            whatsapp: string | null;
            instagram: string | null;
            bio: string | null;
        } | null;
    }>;
    getUserPosts(userId: string, page?: number, limit?: number): Promise<{
        posts: ({
            category: {
                name: string;
                icon: string | null;
            };
            location: {
                city: string;
            };
        } & {
            id: string;
            title: string;
            description: string;
            price: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.PostStatus;
            viewCount: number;
            categoryId: string;
            locationId: string;
            images: string[];
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getSavedPosts(userId: string, page?: number, limit?: number): Promise<{
        posts: ({
            category: {
                name: string;
                icon: string | null;
            };
            location: {
                city: string;
            };
            user: {
                id: string;
                name: string | null;
                email: string;
            };
        } & {
            id: string;
            title: string;
            description: string;
            price: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.PostStatus;
            viewCount: number;
            categoryId: string;
            locationId: string;
            images: string[];
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    savePost(userId: string, postId: string): Promise<{
        message: string;
    }>;
    unsavePost(userId: string, postId: string): Promise<{
        message: string;
    }>;
    isPostSaved(userId: string, postId: string): Promise<{
        isSaved: boolean;
    }>;
}
