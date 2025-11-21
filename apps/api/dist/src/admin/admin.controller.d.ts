import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        totalUsers: number;
        totalPosts: number;
        recentPosts: number;
        postsByCategory: {
            category: string;
            count: number;
        }[];
    }>;
    getAllUsers(): Promise<{
        id: string;
        createdAt: Date;
        _count: {
            posts: number;
        };
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    updateUserRole(id: string, body: {
        role: 'USER' | 'ADMIN';
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        password: string;
        phone: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        refreshToken: string | null;
    }>;
    deleteUser(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        password: string;
        phone: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        refreshToken: string | null;
    }>;
    getAllPosts(page: string, limit: string): Promise<{
        posts: ({
            category: {
                name: string;
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
    deletePost(id: string): Promise<{
        message: string;
    }>;
    reindexPosts(): Promise<{
        message: string;
        totalIndexed: number;
    }>;
    getAllCategories(): Promise<({
        _count: {
            posts: number;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        icon: string | null;
        parentId: string | null;
    })[]>;
    getAllLocations(): Promise<({
        _count: {
            posts: number;
        };
    } & {
        id: string;
        city: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        state: string | null;
        latitude: number | null;
        longitude: number | null;
        weight: number;
    })[]>;
}
