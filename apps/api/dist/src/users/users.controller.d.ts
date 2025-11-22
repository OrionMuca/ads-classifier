import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
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
    getUserPosts(req: any, page: string, limit: string): Promise<{
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
            zoneId: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getSavedPosts(req: any, page: string, limit: string): Promise<{
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
            zoneId: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    savePost(req: any, postId: string): Promise<{
        message: string;
    }>;
    unsavePost(req: any, postId: string): Promise<{
        message: string;
    }>;
    checkSaved(req: any, postId: string): Promise<{
        isSaved: boolean;
    }>;
}
