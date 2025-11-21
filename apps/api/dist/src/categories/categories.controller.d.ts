import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<({
        _count: {
            posts: number;
        };
        children: ({
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
        })[];
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
    findOne(id: string): Promise<({
        _count: {
            posts: number;
        };
        parent: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            icon: string | null;
            parentId: string | null;
        } | null;
        children: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            icon: string | null;
            parentId: string | null;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        icon: string | null;
        parentId: string | null;
    }) | null>;
    findBySlug(slug: string): Promise<({
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
    }) | null>;
}
