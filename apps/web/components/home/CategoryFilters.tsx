'use client';

import { useCategories } from '@/lib/api-hooks';
import { Category } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useRef, useState, useEffect } from 'react';
import { CategoryIcon } from '@/lib/category-icons';

interface CategoryFiltersProps {
    selectedCategoryId?: string;
    onCategorySelect: (categoryId: string) => void;
}

export function CategoryFilters({ selectedCategoryId, onCategorySelect }: CategoryFiltersProps) {
    const { data: categories = [], isLoading } = useCategories();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Flatten categories to show parent categories and popular subcategories
    const displayCategories = categories
        .filter(cat => !cat.parentId) // Only parent categories
        .slice(0, 12); // Limit to 12 most popular

    // Check scroll position
    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 300;
        const currentScroll = scrollContainerRef.current.scrollLeft;
        const targetScroll = direction === 'left' 
            ? currentScroll - scrollAmount 
            : currentScroll + scrollAmount;
        
        scrollContainerRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth',
        });
    };

    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2 px-4 sm:px-6 lg:px-8">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0"
                    />
                ))}
            </div>
        );
    }

    if (displayCategories.length === 0) {
        return null;
    }

    return (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Left scroll button */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-900 shadow-lg rounded-full p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
            )}

            {/* Category chips */}
            <div
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {/* All Categories button */}
                <button
                    onClick={() => onCategorySelect('')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 transition-all ${
                        !selectedCategoryId
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                    <Squares2X2Icon className="w-4 h-4" />
                    <span>Të gjitha</span>
                </button>

                {/* Category chips */}
                {displayCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategorySelect(category.id === selectedCategoryId ? '' : category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 transition-all ${
                            selectedCategoryId === category.id
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        <CategoryIcon 
                            categoryName={category.name} 
                            className={`w-4 h-4 ${
                                selectedCategoryId === category.id
                                    ? 'text-white'
                                    : 'text-slate-600 dark:text-slate-400'
                            }`}
                        />
                        <span>{category.name}</span>
                        {category._count?.posts && (
                            <span className={`text-xs ${
                                selectedCategoryId === category.id
                                    ? 'text-primary-100'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}>
                                ({category._count.posts})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Right scroll button */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-900 shadow-lg rounded-full p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Scroll right"
                >
                    <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}

