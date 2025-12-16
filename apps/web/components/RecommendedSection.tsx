'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SparklesIcon, FireIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { ProductCarousel } from './ProductCarousel';
import { useAuth } from '@/contexts/AuthContext';

export function RecommendedSection() {
    const { isAuthenticated } = useAuth();

    // For authenticated users: personalized recommendations
    const { data: recommendationsData, isLoading: isLoadingRecommendations } = useQuery({
        queryKey: ['recommendations'],
        queryFn: async () => {
            const response = await api.get('/search/recommendations?size=12');
            return response.data;
        },
        enabled: isAuthenticated,
    });

    // For guests: popular/trending products
    const { data: popularData, isLoading: isLoadingPopular } = useQuery({
        queryKey: ['popular-products'],
        queryFn: async () => {
            const response = await api.get('/search/popular?size=12');
            return response.data;
        },
        enabled: !isAuthenticated,
    });

    const isLoading = isAuthenticated ? isLoadingRecommendations : isLoadingPopular;
    const data = isAuthenticated ? recommendationsData : popularData;

    if (isLoading || !data?.hits?.length) {
        return null;
    }

    return (
        <section className="py-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-8">
                    {isAuthenticated ? (
                        <>
                            <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Recommended for You
                            </h2>
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                Personalized
                            </span>
                        </>
                    ) : (
                        <>
                            <FireIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Popular Products
                            </h2>
                            <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
                                Trending
                            </span>
                        </>
                    )}
                </div>

                <ProductCarousel 
                    products={data.hits} 
                    showNavigation={true}
                />
            </div>
        </section>
    );
}
