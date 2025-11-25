import { useQuery } from '@tanstack/react-query';
import api from './api';
import { Category, Location, Post } from '../types';

// Fetch all categories
export function useCategories() {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/categories');
            return data;
        },
    });
}

// Fetch all locations (Albanian cities, ordered by weight)
export function useLocations() {
    return useQuery<Location[]>({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data } = await api.get('/locations');
            return data;
        },
    });
}

export function useZones(locationId?: string) {
    return useQuery<Zone[]>({
        queryKey: ['zones', locationId],
        queryFn: async () => {
            if (!locationId) return [];
            const { data } = await api.get(`/zones/location/${locationId}`);
            return data;
        },
        enabled: !!locationId,
    });
}

// Fetch posts (used by admin)
export function usePosts(page: number = 1) {
    return useQuery<{ posts: Post[]; total: number; page: number; totalPages: number }>({
        queryKey: ['posts', page],
        queryFn: async () => {
            const { data } = await api.get(`/posts?page=${page}`);
            return data;
        },
    });
}
