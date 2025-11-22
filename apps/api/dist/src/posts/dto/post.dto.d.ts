declare enum PostStatus {
    ACTIVE = "ACTIVE",
    SOLD = "SOLD",
    HIDDEN = "HIDDEN",
    DELETED = "DELETED"
}
export declare class CreatePostDto {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    locationId: string;
    zoneId?: string;
    images?: string[];
}
export declare class UpdatePostDto {
    title?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    locationId?: string;
    zoneId?: string;
    images?: string[];
    status?: PostStatus;
}
export {};
