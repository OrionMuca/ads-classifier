'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ProductCarousel } from './ProductCarousel';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface RelatedProductsProps {
    postId: string;
}

export function RelatedProducts({ postId }: RelatedProductsProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['related-products', postId],
        queryFn: async () => {
            const response = await api.get(`/search/related/${postId}?size=12`);
            return response.data;
        },
        enabled: !!postId,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    if (isLoading) {
        return (
            <section className="py-8 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 mb-6">
                        <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 animate-pulse" />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Related Products
                        </h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[280px] sm:w-[300px] h-[400px] bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!data?.hits || data.hits.length === 0) {
        return null;
    }

    return (
        <section className="py-8 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-6">
                    <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Related Products
                    </h2>
                    <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
                        {data.total} found
                    </span>
                </div>

                <ProductCarousel 
                    products={data.hits} 
                    showNavigation={true}
                />
            </div>
        </section>
    );
}

