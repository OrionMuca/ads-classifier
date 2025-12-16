'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { Post } from '@/types';

interface HeroItem {
    id: string;
    type: 'post' | 'ad';
    title: string;
    image: string;
    link?: string;
    price?: number;
    category?: string;
}

const ROTATION_INTERVAL = 5000; // 5 seconds

export function HeroSection() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch popular posts
    const { data: popularData } = useQuery({
        queryKey: ['hero-popular'],
        queryFn: async () => {
            const response = await api.get('/search/popular?size=5');
            return response.data?.hits || [];
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Fetch active banner ads
    const { data: ads } = useQuery({
        queryKey: ['hero-ads'],
        queryFn: async () => {
            const { data } = await api.get('/ads?activeOnly=true&layout=BANNER');
            return data || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Combine posts and ads for hero carousel
    // Best practice: Show featured/popular products first, then ads
    // Priority: 1) Popular/Trending products (3-4 items), 2) Banner ads (1-2 items)
    const heroItems: HeroItem[] = [
        // Featured products first (most important for marketplace)
        ...(popularData || []).slice(0, 4).map((post: any) => ({
            id: post.id,
            type: 'post' as const,
            title: post.title,
            image: post.images?.[0] || '/placeholder.jpg',
            price: post.price,
            category: post.category?.name,
        })),
        // Banner ads after products (max 2 to avoid overwhelming)
        ...(ads || []).slice(0, 2).map((ad: any) => ({
            id: ad.id,
            type: 'ad' as const,
            title: ad.title,
            image: ad.image,
            link: ad.link,
        })),
    ];

    // Auto-rotate carousel
    useEffect(() => {
        if (heroItems.length <= 1 || isPaused) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroItems.length);
        }, ROTATION_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [heroItems.length, isPaused]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000); // Resume after 10 seconds
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % heroItems.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000);
    };

    const handleItemClick = (item: HeroItem) => {
        if (item.type === 'ad' && item.link) {
            window.open(item.link, '_blank', 'noopener,noreferrer');
        } else if (item.type === 'post') {
            router.push(`/posts/${item.id}`);
        }
    };

    if (!heroItems.length) {
        // Fallback to static hero if no items
        return (
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-6 text-center">
                        Gjeni çdo gjë që ju nevojitet
                    </h1>
                    <p className="text-center text-primary-100 text-lg mb-8">
                        Kërkoni në shiritin e kërkimit për të gjetur produkte të shumta
                    </p>
                </div>
            </div>
        );
    }

    const currentItem = heroItems[currentIndex];

    return (
        <div
            className="relative h-[280px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
            style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
        >
            {/* Background Image - with hardware acceleration fix for mobile */}
            <div className="absolute inset-0 transition-opacity duration-1000" style={{ transform: 'translateZ(0)', willChange: 'opacity' }}>
                <img
                    src={currentItem.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.3, transform: 'translateZ(0)' }}
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-primary-600/80" style={{ transform: 'translateZ(0)' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl">
                        {/* Badge - Show category for products, ad label for ads */}
                        {currentItem.type === 'ad' && (
                            <div className="inline-flex items-center gap-1.5 mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">
                                <span>📢</span>
                                <span>Reklamë</span>
                            </div>
                        )}
                        {currentItem.type === 'post' && currentItem.category && (
                            <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">
                                {currentItem.category}
                            </div>
                        )}
                        {currentItem.type === 'post' && !currentItem.category && (
                            <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">
                                Produkt i Rekomanduar
                            </div>
                        )}

                        {/* Title - Optimized for mobile readability */}
                        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl leading-tight line-clamp-2">
                            {currentItem.title}
                        </h1>

                        {/* Price (for posts) */}
                        {currentItem.type === 'post' && currentItem.price && (
                            <p className="text-lg sm:text-xl md:text-2xl text-primary-100 mb-4 sm:mb-6 font-semibold drop-shadow-lg">
                                €{Number(currentItem.price).toLocaleString()}
                            </p>
                        )}

                        {/* CTA Button - Mobile optimized touch target */}
                        <button
                            onClick={() => handleItemClick(currentItem)}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-4 bg-white text-primary-600 rounded-full font-semibold text-sm sm:text-lg hover:bg-primary-50 active:scale-95 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[44px] sm:min-h-0"
                        >
                            <span>
                                {currentItem.type === 'ad' ? 'Shiko Reklamën' : 'Shiko Detajet'}
                            </span>
                            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {heroItems.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/40 rounded-full p-2 sm:p-3 transition-all shadow-lg"
                        aria-label="Previous slide"
                    >
                        <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/40 rounded-full p-2 sm:p-3 transition-all shadow-lg"
                        aria-label="Next slide"
                    >
                        <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                </>
            )}

            {/* Dots Indicator - Smaller on mobile */}
            {/* 
            {heroItems.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
                    {heroItems.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'w-6 sm:w-8 bg-white'
                                    : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
            */}
        </div>
    );
}

