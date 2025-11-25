'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ImageGalleryProps {
    images: string[];
    title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                <span className="text-slate-400">No Image</span>
            </div>
        );
    }

    const goToPrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const goToImage = (index: number) => {
        setSelectedIndex(index);
    };

    return (
        <div className="space-y-4">
            {/* Main Image Display */}
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden group">
                <Image
                    src={images[selectedIndex]}
                    alt={`${title} - Image ${selectedIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={selectedIndex === 0}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Next image"
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {selectedIndex + 1} / {images.length}
                    </div>
                )}

                {/* Keyboard Navigation */}
                <div
                    className="absolute inset-0 focus-within:outline-none"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') goToPrevious();
                        if (e.key === 'ArrowRight') goToNext();
                    }}
                />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                index === selectedIndex
                                    ? 'border-primary-600 dark:border-primary-400 ring-2 ring-primary-600/20 dark:ring-primary-400/20'
                                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                            }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            <Image
                                src={image}
                                alt={`${title} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            {index === selectedIndex && (
                                <div className="absolute inset-0 bg-primary-600/10" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

