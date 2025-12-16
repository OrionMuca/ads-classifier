'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch trending products when modal opens
    const { data: trendingProducts } = useQuery({
        queryKey: ['trending-products-modal'],
        queryFn: async () => {
            const { data } = await api.get('/posts?sortBy=views&limit=10');
            return data.posts || [];
        },
        enabled: isOpen,
    });

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Fetch search suggestions
    useEffect(() => {
        if (searchQuery.length > 0) {
            const fetchSuggestions = async () => {
                try {
                    const { data } = await api.get(`/search/suggest?query=${encodeURIComponent(searchQuery)}&limit=5`);
                    setSuggestions(data || []);
                } catch (error) {
                    // Silently fail - suggestions are optional
                }
            };
            const debounce = setTimeout(fetchSuggestions, 300);
            return () => clearTimeout(debounce);
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?query=${encodeURIComponent(searchQuery.trim())}`);
            onClose();
            setSearchQuery('');
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        router.push(`/?query=${encodeURIComponent(suggestion)}`);
        onClose();
        setSearchQuery('');
    };

    const handleProductClick = () => {
        onClose();
        setSearchQuery('');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-x-0 top-0 z-50 animate-in slide-in-from-top duration-300">
                <div className="bg-white dark:bg-slate-900 min-h-screen">
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </button>
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Kërko produkte..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                                    Sugjerime
                                </h3>
                                <div className="space-y-2">
                                    {suggestions.map((suggestion: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion.text)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left group transition-all bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500"
                                        >
                                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0" />
                                            <span className="text-slate-900 dark:text-slate-100 font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{suggestion.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trending Products */}
                        {searchQuery.length === 0 && trendingProducts && trendingProducts.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                                    🔥 Në Trend Tani
                                </h3>
                                <div className="space-y-3">
                                    {trendingProducts.map((product: any) => (
                                        <Link
                                            key={product.id}
                                            href={`/posts/${product.id}`}
                                            onClick={handleProductClick}
                                            className="flex gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            {product.images && product.images.length > 0 && (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 mb-1">
                                                    {product.title}
                                                </h4>
                                                {product.price !== undefined && (
                                                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                        €{Number(product.price).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {searchQuery.length > 0 && suggestions.length === 0 && (
                            <div className="text-center py-8">
                                <MagnifyingGlassIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400">
                                    Nuk u gjetën sugjerime
                                </p>
                                <button
                                    onClick={handleSearch}
                                    className="mt-4 btn-primary"
                                >
                                    Kërko për "{searchQuery}"
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
