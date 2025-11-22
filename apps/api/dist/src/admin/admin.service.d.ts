import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchService } from '../search/elasticsearch.service';
export declare class AdminService {
    private prisma;
    private elasticsearchService;
    constructor(prisma: PrismaService, elasticsearchService: ElasticsearchService);
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
    updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<{
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
    deleteUser(userId: string): Promise<{
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
    getAllPosts(page?: number, limit?: number): Promise<{
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
            zoneId: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    deletePost(postId: string): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        totalUsers: number;
        totalPosts: number;
        recentPosts: number;
        postsByCategory: {
            category: string;
            count: number;
        }[];
    }>;
    reindexAllPosts(): Promise<{
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
        hasZones: boolean;
    })[]>;
}
