'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    Bars3Icon,
    XMarkIcon,
    PlusIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    BookmarkIcon,
    AdjustmentsHorizontalIcon,
    FireIcon
} from '@heroicons/react/24/outline';

interface NavbarProps {
    hideSearch?: boolean;
}

export function Navbar({ hideSearch = false }: NavbarProps) {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
    const [isLoadingTrendingProducts, setIsLoadingTrendingProducts] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [hasFocused, setHasFocused] = useState(false);
    const [isMac, setIsMac] = useState(false);
    const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);


    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }, []);

    useEffect(() => {
        const handleKeyboardShortcut = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyboardShortcut);
        return () => document.removeEventListener('keydown', handleKeyboardShortcut);
    }, []);

    // Scroll selected suggestion into view
    useEffect(() => {
        if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
            suggestionRefs.current[selectedIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [selectedIndex]);

    useEffect(() => {
        const urlQuery = searchParams.get('query') || '';
        const isInputFocused = document.activeElement === inputRef.current;
        // Only sync URL to input if input is not focused and not showing suggestions
        if (urlQuery !== searchQuery && !isInputFocused && !showSuggestions) {
            setSearchQuery(urlQuery);
        }
    }, [searchParams]);

    useEffect(() => {
        const updateDropdownWidth = () => {
            if (inputRef.current) {
                const width = inputRef.current.offsetWidth;
                setDropdownWidth(width);
            } else if (inputContainerRef.current) {
                const width = inputContainerRef.current.offsetWidth;
                setDropdownWidth(width);
            }
        };

        updateDropdownWidth();
        window.addEventListener('resize', updateDropdownWidth);
        
        if (showSuggestions) {
            setTimeout(updateDropdownWidth, 0);
        }
        
        return () => window.removeEventListener('resize', updateDropdownWidth);
    }, [showSuggestions]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch trending products when search bar is focused and empty
    useEffect(() => {
        let isCancelled = false;

        const fetchTrendingProducts = async () => {
            if (searchQuery.length === 0 && showSuggestions && hasFocused) {
                setIsLoadingTrendingProducts(true);
                try {
                    const { data } = await api.get('/search/trending-products?size=6');
                    if (!isCancelled) {
                        setTrendingProducts(Array.isArray(data?.hits) ? data.hits : []);
                    }
                } catch (error) {
                    if (!isCancelled) setTrendingProducts([]);
                } finally {
                    if (!isCancelled) setIsLoadingTrendingProducts(false);
                }
            } else {
                setTrendingProducts([]);
            }
        };

        const timer = setTimeout(fetchTrendingProducts, 100);

        return () => {
            clearTimeout(timer);
            isCancelled = true;
        };
    }, [searchQuery, showSuggestions, hasFocused]);

    useEffect(() => {
        let isCancelled = false;

        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            try {
                if (searchQuery.length >= 2) {
                    const { data } = await api.get(`/search/suggest?query=${encodeURIComponent(searchQuery)}`);
                    if (!isCancelled) {
                        const suggestionsData = Array.isArray(data) ? data : [];
                        setSuggestions(suggestionsData);
                        setSelectedIndex(-1);
                        if (showSuggestions) {
                            setShowSuggestions(true);
                        }
                    }
                } else if (searchQuery.length === 0 && showSuggestions && hasFocused) {
                    if (isAuthenticated) {
                        try {
                            const { data: historyData } = await api.get('/search/history?limit=8');
                            if (!isCancelled) {
                                const historySuggestions = (historyData || [])
                                    .filter((h: any) => h.query && h.query.trim())
                                    .map((h: any) => ({
                                        text: h.query,
                                        type: 'history',
                                        timestamp: h.timestamp,
                                    }));
                                setSuggestions(historySuggestions);
                                setSelectedIndex(-1);
                            }
                        } catch (error) {
                            if (!isCancelled) setSuggestions([]);
                        }
                    } else {
                        try {
                            const { data: trendingData } = await api.get('/search/trending?limit=8');
                            if (!isCancelled) {
                                setSuggestions((trendingData || []).map((t: any) => ({
                                    text: t.text,
                                    type: 'trending',
                                    count: t.count,
                                })));
                                setSelectedIndex(-1);
                            }
                        } catch (error) {
                            if (!isCancelled) setSuggestions([]);
                        }
                    }
                } else {
                    if (!isCancelled) {
                        setSuggestions([]);
                        setSelectedIndex(-1);
                    }
                }
            } catch (error) {
                if (!isCancelled) {
                    setSuggestions([]);
                    setSelectedIndex(-1);
                }
            } finally {
                if (!isCancelled) setIsLoadingSuggestions(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, searchQuery.length >= 2 ? 300 : 100);

        return () => {
            clearTimeout(timer);
            isCancelled = true;
        };
    }, [searchQuery, showSuggestions, isAuthenticated, hasFocused]);

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        router.push('/auth/login');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            const url = `/?query=${encodeURIComponent(trimmedQuery)}`;
            router.push(url);
            setSearchQuery(trimmedQuery);
        } else {
            router.push('/');
            setSearchQuery('');
        }
    };

    const handleSuggestionClick = (suggestion: any, index?: number, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Extract text from suggestion object
        const suggestionText = typeof suggestion === 'string' 
            ? suggestion 
            : (suggestion?.text || suggestion?.query || '');
        
        if (!suggestionText || !suggestionText.trim()) {
            return;
        }

        const trimmedText = suggestionText.trim();
        
        // Close suggestions immediately
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setHasFocused(false);
        
        // Update search query state immediately
        setSearchQuery(trimmedText);
        
        // Navigate to search results
        const url = `/?query=${encodeURIComponent(trimmedText)}`;
        
        // Use router.push to navigate - this will trigger the page to update
        router.push(url);
        
        // Blur input after navigation
        setTimeout(() => {
            inputRef.current?.blur();
        }, 50);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'ArrowDown' && showSuggestions) {
                e.preventDefault();
                setSelectedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex], selectedIndex);
                } else {
                    handleSearch(e as any);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleFocus = () => {
        setShowSuggestions(true);
        setHasFocused(true);
    };

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 sm:bg-white/95 sm:dark:bg-slate-950/95 sm:backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm" style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
            <div className="container mx-auto px-4">
                {/* Top Row - Logo, Search (Desktop), Menu */}
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="p-2 bg-primary-600 rounded-lg group-hover:scale-105 transition-transform shadow-sm">
                            <ShoppingBagIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="hidden md:inline text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                            Marketplace
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    {!hideSearch && (
                        <div className="hidden md:flex flex-1 min-w-0 max-w-2xl mx-4 relative" ref={searchRef}>
                            <form onSubmit={handleSearch} className="w-full flex items-center gap-2 min-w-0">
                                <div ref={inputContainerRef} className="flex-1 relative group min-w-0">
                                    <input
                                        ref={inputRef}
                                        id="main-search-input"
                                        type="text"
                                        placeholder="Search for products..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery(e.target.value);
                                        }}
                                        onFocus={handleFocus}
                                        onKeyDown={handleKeyDown}
                                        className="w-full pl-10 pr-16 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/10 rounded-full transition-all duration-300 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        autoComplete="off"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                                    {/* Keyboard Shortcut Hint */}
                                    <kbd className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-2 py-1 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-medium text-slate-500 dark:text-slate-400 pointer-events-none opacity-60 group-focus-within:opacity-0 transition-opacity">
                                        {isMac ? '⌘' : 'Ctrl'} K
                                    </kbd>
                                    
                                    {/* Autocomplete Dropdown - Inside input container for proper positioning */}
                                    {showSuggestions && (
                                        <div 
                                            className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-900 sm:bg-white/95 sm:dark:bg-slate-900/95 sm:backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden z-50 max-h-96 overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200"
                                            style={{ 
                                                width: dropdownWidth ? `${dropdownWidth}px` : (inputRef.current?.offsetWidth ? `${inputRef.current.offsetWidth}px` : inputContainerRef.current?.offsetWidth ? `${inputContainerRef.current.offsetWidth}px` : '100%'),
                                                maxWidth: inputContainerRef.current?.offsetWidth ? `${inputContainerRef.current.offsetWidth}px` : '100%',
                                                transform: 'translateZ(0)',
                                                WebkitTransform: 'translateZ(0)'
                                            }}
                                        >
                                    {/* Trending Products Section - Show when search is empty */}
                                    {searchQuery.length === 0 && (
                                        <>
                                            {isLoadingTrendingProducts ? (
                                                <div className="px-3 py-3 text-center border-b border-slate-200/50 dark:border-slate-700/50">
                                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                                                </div>
                                            ) : trendingProducts.length > 0 ? (
                                                <>
                                                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                                                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <FireIcon className="w-2.5 h-2.5 text-orange-500" />
                                                            Trending Products
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col border-b border-slate-200/50 dark:border-slate-700/50">
                                                        {trendingProducts.map((product: any) => (
                                                            <Link
                                                                key={product.id}
                                                                href={`/posts/${product.id}`}
                                                                onClick={() => {
                                                                    setShowSuggestions(false);
                                                                    setSearchQuery('');
                                                                }}
                                                                className="group flex flex-row gap-2 sm:gap-2.5 p-2 sm:p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200/30 dark:border-slate-700/30 last:border-0"
                                                            >
                                                                {product.images && product.images.length > 0 && (
                                                                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                                                                        <img
                                                                            src={product.images[0]}
                                                                            alt={product.title}
                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                    <p className="text-[11px] sm:text-xs font-medium text-slate-900 dark:text-white line-clamp-2 leading-tight mb-0.5 sm:mb-1">
                                                                        {product.title}
                                                                    </p>
                                                                    {product.price !== undefined && (
                                                                        <p className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                                            {product.price.toLocaleString()} ALL
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : null}
                                        </>
                                    )}
                                    {isLoadingSuggestions ? (
                                        <div className="px-3 py-5 text-center">
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <>
                                            {searchQuery.length === 0 && (
                                                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        {isAuthenticated ? (
                                                            <>
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Recent Searches
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FireIcon className="w-2.5 h-2.5 text-orange-500" />
                                                                Trending Searches
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    ref={(el) => {
                                                        suggestionRefs.current[index] = el;
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleSuggestionClick(suggestion, index, e);
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-all duration-150 border-b border-slate-100/50 dark:border-slate-800/50 last:border-b-0 group ${index === selectedIndex
                                                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                                                        }`}
                                                >
                                                    {suggestion.type === 'history' ? (
                                                        <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${index === selectedIndex ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    ) : suggestion.type === 'trending' ? (
                                                        <FireIcon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${index === selectedIndex ? 'text-orange-600' : 'text-orange-500'}`} />
                                                    ) : (
                                                        <MagnifyingGlassIcon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${index === selectedIndex ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                                    )}
                                                    <span className={`text-xs flex-1 truncate font-medium transition-colors ${index === selectedIndex ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                                                        {suggestion.text}
                                                    </span>
                                                    {suggestion.type === 'trending' && suggestion.count && (
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                            {suggestion.count}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </>
                                    ) : searchQuery.length === 0 ? (
                                        <div className="px-3 py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                                            {isAuthenticated ? 'No recent searches' : 'Start typing to search'}
                                        </div>
                                    ) : null}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push('/?showFilters=true')}
                                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center gap-2 transition-colors text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md flex-shrink-0"
                                >
                                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                    <span className="hidden lg:inline">Filters</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/posts/new"
                                    className="btn-gradient flex items-center gap-2 text-sm px-4 py-2"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Post Ad</span>
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="avatar">
                                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                        </div>
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="dropdown-menu">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                    {user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            <div className="py-1">
                                                <Link href="/profile" className="dropdown-item text-slate-700 dark:text-slate-200">
                                                    <UserCircleIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                    <span>Profile</span>
                                                </Link>
                                                <Link href="/messages" className="dropdown-item text-slate-700 dark:text-slate-200">
                                                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span>Messages</span>
                                                </Link>
                                                <Link href="/profile?tab=saved" className="dropdown-item text-slate-700 dark:text-slate-200">
                                                    <BookmarkIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                    <span>Saved Items</span>
                                                </Link>
                                                {user?.role === 'ADMIN' && (
                                                    <Link href="/admin" className="dropdown-item text-primary-600 dark:text-primary-400">
                                                        <ShieldCheckIcon className="w-5 h-5" />
                                                        <span>Admin Panel</span>
                                                    </Link>
                                                )}
                                                <Link href="/settings" className="dropdown-item text-slate-700 dark:text-slate-200">
                                                    <Cog6ToothIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                    <span>Settings</span>
                                                </Link>
                                            </div>

                                            <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                                                <button onClick={handleLogout} className="dropdown-item text-red-600 dark:text-red-400 w-full">
                                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="hidden lg:flex items-center gap-3">
                                <Link href="/auth/login" className="text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link href="/auth/register" className="btn-gradient text-sm px-5 py-2">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button - Removed (use bottom nav instead) */}
                </div>

                {/* Mobile Search Bar - Always Visible */}
                {!hideSearch && (
                    <div className="md:hidden pb-3 pt-2">
                        {/* Backdrop Blur Overlay */}
                        {showSuggestions && (
                            <div
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                                onClick={() => setShowSuggestions(false)}
                            />
                        )}

                        <div className="relative z-50" ref={searchRef}>
                            <form onSubmit={handleSearch} className="relative flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        id="mobile-search-input"
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={handleFocus}
                                        onKeyDown={handleKeyDown}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center transition-all hover:shadow-md"
                                >
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                </button>
                            </form>

                            {/* Mobile Autocomplete Dropdown - no blur on mobile for better performance */}
                            {showSuggestions && (
                                <div 
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden z-50 max-h-96 overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200"
                                    style={{ 
                                        transform: 'translateZ(0)',
                                        WebkitTransform: 'translateZ(0)'
                                    }}
                                >
                                    {/* Trending Products Section - Show when search is empty */}
                                    {searchQuery.length === 0 && (
                                        <>
                                            {isLoadingTrendingProducts ? (
                                                <div className="px-3 py-3 text-center border-b border-slate-200/50 dark:border-slate-700/50">
                                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                                                </div>
                                            ) : trendingProducts.length > 0 ? (
                                                <>
                                                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                                                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                            <FireIcon className="w-2.5 h-2.5 text-orange-500" />
                                                            Trending Products
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col border-b border-slate-200/50 dark:border-slate-700/50">
                                                        {trendingProducts.map((product: any) => (
                                                            <Link
                                                                key={product.id}
                                                                href={`/posts/${product.id}`}
                                                                onClick={() => {
                                                                    setShowSuggestions(false);
                                                                    setSearchQuery('');
                                                                }}
                                                                className="group flex flex-row gap-2 sm:gap-2.5 p-2 sm:p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200/30 dark:border-slate-700/30 last:border-0"
                                                            >
                                                                {product.images && product.images.length > 0 && (
                                                                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                                                                        <img
                                                                            src={product.images[0]}
                                                                            alt={product.title}
                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                    <p className="text-[11px] sm:text-xs font-medium text-slate-900 dark:text-white line-clamp-2 leading-tight mb-0.5 sm:mb-1">
                                                                        {product.title}
                                                                    </p>
                                                                    {product.price !== undefined && (
                                                                        <p className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                                            {product.price.toLocaleString()} ALL
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : null}
                                        </>
                                    )}
                                    {isLoadingSuggestions ? (
                                        <div className="px-3 py-5 text-center">
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <>
                                            {searchQuery.length === 0 && (
                                                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        {isAuthenticated ? (
                                                            <>
                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Recent Searches
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FireIcon className="w-2.5 h-2.5 text-orange-500" />
                                                                Trending Searches
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    ref={(el) => {
                                                        suggestionRefs.current[index] = el;
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleSuggestionClick(suggestion, index, e);
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-all duration-150 border-b border-slate-100/50 dark:border-slate-800/50 last:border-b-0 group ${index === selectedIndex
                                                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                                                        }`}
                                                >
                                                    {suggestion.type === 'history' ? (
                                                        <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${index === selectedIndex ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    ) : suggestion.type === 'trending' ? (
                                                        <FireIcon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${index === selectedIndex ? 'text-orange-600' : 'text-orange-500'}`} />
                                                    ) : (
                                                        <MagnifyingGlassIcon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${index === selectedIndex ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                                    )}
                                                    <span className={`text-xs flex-1 truncate font-medium transition-colors ${index === selectedIndex ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                                                        {suggestion.text}
                                                    </span>
                                                    {suggestion.type === 'trending' && suggestion.count && (
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                            {suggestion.count}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </>
                                    ) : searchQuery.length === 0 ? (
                                        <div className="px-3 py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                                            {isAuthenticated ? 'No recent searches' : 'Start typing to search'}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Menu Removed - Use bottom navigation instead */}
        </nav>
    );
}
