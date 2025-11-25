'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
    products: any[];
    title?: string;
    showNavigation?: boolean;
}

export function ProductCarousel({ products, title, showNavigation = true }: ProductCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    // Check scrollability on mount and when products change
    useEffect(() => {
        checkScrollability();
        // Also check after a short delay to ensure DOM is fully rendered
        const timer = setTimeout(checkScrollability, 100);
        return () => clearTimeout(timer);
    }, [products]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                </div>
            )}
            
            <div className="relative">
                {/* Navigation Buttons */}
                {showNavigation && (
                    <>
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${
                                !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label="Scroll left"
                        >
                            <ChevronLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${
                                !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label="Scroll right"
                        >
                            <ChevronRightIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </button>
                    </>
                )}

                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    onScroll={checkScrollability}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-1"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {products.map((post: any) => (
                        <div
                            key={post.id}
                            className="flex-shrink-0 w-[280px] sm:w-[300px]"
                        >
                            <ProductCard post={post} showSaveButton={true} />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}

