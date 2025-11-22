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
        zoneId: string | null;
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
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
