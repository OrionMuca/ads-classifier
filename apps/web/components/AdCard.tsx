'use client';

import { useEffect } from 'react';
import api from '@/lib/api';

interface AdCardProps {
    ad: {
        id: string;
        title: string;
        image: string;
        link?: string;
        layout?: 'CARD' | 'BANNER';
    };
}

export function AdCard({ ad }: AdCardProps) {
    // Track ad view when component mounts
    useEffect(() => {
        api.post(`/ads/${ad.id}/view`).catch(() => {
            // Silently fail if tracking fails
        });
    }, [ad.id]);

    const handleClick = () => {
        // Track click
        api.post(`/ads/${ad.id}/click`).catch(() => {
            // Silently fail if tracking fails
        });

        // Open link if provided
        if (ad.link) {
            window.open(ad.link, '_blank', 'noopener,noreferrer');
        }
    };

    const content = (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative group cursor-pointer hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200">
            <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                    src={ad.image}
                    alt={ad.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-primary-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                    Ad
                </div>
            </div>
            <div className="p-2.5 sm:p-3">
                <h3 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {ad.title}
                </h3>
            </div>
        </div>
    );

    if (ad.link) {
        return (
            <div onClick={handleClick} className="cursor-pointer">
                {content}
            </div>
        );
    }

    return content;
}

