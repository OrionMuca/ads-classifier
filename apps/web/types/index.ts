export interface User {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    parentId?: string | null;
    children?: Category[];
    _count?: {
        posts: number;
    };
}

export interface Location {
    id: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    weight: number;
    hasZones?: boolean;
    _count?: {
        posts: number;
    };
}

export interface Zone {
    id: string;
    name: string;
    locationId: string;
    location?: Location;
    createdAt?: string;
    updatedAt?: string;
}

export interface Post {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    status: 'ACTIVE' | 'SOLD' | 'HIDDEN' | 'DELETED';
    viewCount: number;
    categoryId: string;
    category: Category;
    locationId: string;
    location: Location;
    zoneId?: string | null;
    zone?: Zone | null;
    userId: string;
    user?: {
        id: string;
        name?: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    // Legacy support
    access_token?: string;
    refresh_token?: string;
}

export interface SearchParams {
    query?: string;
    categoryId?: string;
    locationId?: string;
    minPrice?: number;
    maxPrice?: number;
    searchAfter?: any[];
    size?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}
