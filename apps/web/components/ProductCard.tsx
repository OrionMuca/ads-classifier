'use client';

import Link from 'next/link';
import { Post } from '@/types';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryIcon } from '@/lib/category-icons';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
    post: Post | any; // Allow any for Elasticsearch flattened format
    showSaveButton?: boolean; // Show save button
    viewMode?: 'grid' | 'list'; // View mode for layout
}

export function ProductCard({ post, showSaveButton = false, viewMode = 'grid' }: ProductCardProps) {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    // Handle both nested (from API) and flattened (from Elasticsearch) formats
    const city = post.location?.city || (post as any).city;
    const categoryName = post.category?.name || (post as any).categoryName;
    const categoryIcon = post.category?.icon || '';

    // Check if post is saved
    const { data: saveStatus } = useQuery({
        queryKey: ['post-saved', post.id],
        queryFn: async () => {
            const { data } = await api.get(`/users/saved/${post.id}/check`);
            return data;
        },
        enabled: isAuthenticated && showSaveButton,
    });

    // Save/unsave mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (saveStatus?.isSaved) {
                await api.delete(`/users/saved/${post.id}`);
            } else {
                await api.post(`/users/saved/${post.id}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post-saved', post.id] });
            queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
    });

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Please login to save posts');
            return;
        }

        saveMutation.mutate();
    };

    // List view layout
    if (viewMode === 'list') {
        return (
            <Link href={`/posts/${post.id}`}>
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 group cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 overflow-hidden relative flex flex-row h-20 sm:h-24 md:h-28">
                    {/* Save Button */}
                    {showSaveButton && isAuthenticated && (
                        <button
                            onClick={handleSaveClick}
                            disabled={saveMutation.isPending}
                            className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:scale-110 transition-transform disabled:opacity-50"
                            title={saveStatus?.isSaved ? 'Unsave' : 'Save'}
                        >
                            {saveStatus?.isSaved ? (
                                <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                        </button>
                    )}

                    {/* Image - Responsive width for list view */}
                    <div className="relative w-20 sm:w-24 md:w-28 h-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <img
                            src={post.images?.[0] || '/placeholder.png'}
                            alt={post.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {post.status === 'SOLD' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full font-semibold text-[10px]">
                                    E shitur
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content - Mobile responsive */}
                    <div className="flex flex-col flex-grow p-1.5 sm:p-2.5 md:p-3 justify-between">
                        <div>
                            <h3 className="font-medium text-[11px] sm:text-xs md:text-sm text-slate-900 dark:text-white mb-0.5 sm:mb-1 line-clamp-2 leading-tight">
                                {post.title}
                            </h3>
                            <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] md:text-xs text-slate-600 dark:text-slate-400">
                                {city && (
                                    <span className="flex items-center gap-0.5">
                                        <MapPinIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                                        <span className="hidden sm:inline">{city}</span>
                                    </span>
                                )}
                                {categoryName && (
                                    <span className="flex items-center gap-0.5">
                                        <CategoryIcon categoryName={categoryName} className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                                        <span className="hidden sm:inline">{categoryName}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base font-bold text-primary-600 dark:text-primary-400 mt-0.5 sm:mt-1">
                            €{post.price.toLocaleString()}
                        </p>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid view layout (default)
    return (
        <Link href={`/posts/${post.id}`}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 group cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 overflow-hidden relative flex flex-col h-full">
                {/* Save Button */}
                {showSaveButton && isAuthenticated && (
                    <button
                        onClick={handleSaveClick}
                        disabled={saveMutation.isPending}
                        className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:scale-110 transition-transform disabled:opacity-50"
                        title={saveStatus?.isSaved ? 'Unsave' : 'Save'}
                    >
                        {saveStatus?.isSaved ? (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        )}
                    </button>
                )}

                {/* Image - Compact aspect ratio (4:3) for better space usage */}
                <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0" style={{ aspectRatio: '4 / 3' }}>
                    <img
                        src={post.images?.[0] || '/placeholder.png'}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {post.status === 'SOLD' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold text-[10px]">
                                E shitur
                            </span>
                        </div>
                    )}
                </div>

                {/* Content - Compact spacing */}
                <div className="flex flex-col flex-grow p-2 sm:p-2.5">
                    {/* Title - Compact */}
                    <h3 className="font-medium text-[11px] sm:text-xs text-slate-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                        {post.title}
                    </h3>

                    {/* Price - Compact but readable */}
                    <p className="text-sm sm:text-base font-bold text-primary-600 dark:text-primary-400 mb-1">
                        €{post.price.toLocaleString()}
                    </p>

                    {/* Location - Compact */}
                    {city && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-0.5">
                            <MapPinIcon className="w-2.5 h-2.5 flex-shrink-0" />
                            {city}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
