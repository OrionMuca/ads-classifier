import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchService } from '../search/elasticsearch.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
export declare class PostsService {
    private prisma;
    private elasticsearchService;
    constructor(prisma: PrismaService, elasticsearchService: ElasticsearchService);
    create(createPostDto: CreatePostDto, userId: string): Promise<{
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
    }>;
    findAll(page?: number, limit?: number): Promise<{
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
    findOne(id: string): Promise<({
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
    }) | null>;
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
    }[]>;
    update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<{
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
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
