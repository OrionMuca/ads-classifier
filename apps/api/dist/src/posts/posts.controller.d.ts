import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    findAll(page: string, limit: string): Promise<{
        posts: ({
            category: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string;
                icon: string | null;
                parentId: string | null;
            };
            location: {
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
    findByUserId(userId: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            icon: string | null;
            parentId: string | null;
        };
        location: {
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
        };
        zone: {
            id: string;
            locationId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        } | null;
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
    }>;
    create(createPostDto: CreatePostDto, req: any): Promise<{
        category: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            icon: string | null;
            parentId: string | null;
        };
        location: {
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
        };
        zone: {
            id: string;
            locationId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        } | null;
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
    }>;
    update(id: string, updatePostDto: UpdatePostDto, req: any): Promise<{
        category: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            icon: string | null;
            parentId: string | null;
        };
        location: {
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
        };
        zone: {
            id: string;
            locationId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        } | null;
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
    }>;
    remove(id: string, req: any): Promise<void>;
}
