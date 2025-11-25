'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Post } from '@/types';
import { Navbar } from '@/components/Navbar';
import { FilterDrawer } from '@/components/FilterDrawer';
import { ProductCard } from '@/components/ProductCard';
import { AdCard } from '@/components/AdCard';
import { AdBanner } from '@/components/AdBanner';
import { RecommendedSection } from '@/components/RecommendedSection';
import { ActiveFilters } from '@/components/ActiveFilters';
import { CategoryFilters } from '@/components/home/CategoryFilters';
import { HeroSection } from '@/components/home/HeroSection';
import { ViewToggle, ViewMode } from '@/components/home/ViewToggle';
import { SortOption } from '@/components/FilterDrawer';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('query') || '';
  const showFilters = searchParams.get('showFilters') === 'true';

  const [search, setSearch] = useState(urlQuery);
  const [filters, setFilters] = useState({
    categoryId: '',
    locationId: '',
    minPrice: '',
    maxPrice: '',
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewMode');
      return (saved === 'grid' || saved === 'list') ? saved : 'grid';
    }
    return 'grid';
  });

  // Save view mode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewMode', viewMode);
    }
  }, [viewMode]);

  // Sync search state with URL query param - always update when URL changes
  useEffect(() => {
    const newSearch = urlQuery || '';
    // Always update, even if same value, to trigger refetch
    setSearch(newSearch);
  }, [urlQuery]);

  // Open filter drawer if showFilters param is in URL
  useEffect(() => {
    if (showFilters) {
      setIsFilterOpen(true);
      // Remove the showFilters param from URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('showFilters');
      const newUrl = newParams.toString() ? `/?${newParams.toString()}` : '/';
      window.history.replaceState({}, '', newUrl);
    }
  }, [showFilters, searchParams]);

  // Debug: Log API URL on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const apiUrl = hostname === 'localhost' || hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : `http://${hostname}:3000`;
      console.log('🔧 Page loaded - API URL should be:', apiUrl);
      console.log('🔧 Current hostname:', hostname);
      console.log('🔧 Full URL:', window.location.href);
    }
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, isError } = useInfiniteQuery({
    queryKey: ['posts', search.trim(), filters, sortBy],
    queryFn: async ({ pageParam }) => {
      try {
        const params = new URLSearchParams();
        if (search && search.trim()) params.append('query', search.trim());
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.locationId) params.append('locationId', filters.locationId);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (sortBy) params.append('sortBy', sortBy);
        if (pageParam) params.append('searchAfter', JSON.stringify(pageParam));

        const searchUrl = `/search?${params.toString()}`;
        
        const response = await api.get(searchUrl);
        console.log('✅ Search response:', {
          total: response.data?.total,
          hitsCount: response.data?.hits?.length,
          firstHit: response.data?.hits?.[0],
        });
        
        return response.data;
      } catch (err: any) {
        console.error('❌ Search error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
          baseURL: err.config?.baseURL,
        });
        throw err;
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hits || lastPage.hits.length === 0) return undefined;
      const lastItem = lastPage.hits[lastPage.hits.length - 1];
      return lastItem?.sort || undefined;
    },
    initialPageParam: undefined,
    staleTime: 0, // Always refetch when query changes
    refetchOnMount: true, // Always refetch when component mounts
    enabled: true, // Always enabled
    retry: 2, // Retry failed requests
  });

  const allPosts = data?.pages.flatMap((page) => page.hits) || [];

  // Fetch active ads
  const { data: ads } = useQuery({
    queryKey: ['ads', 'active'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/ads?activeOnly=true');
        console.log('📢 Ads loaded:', data?.length || 0);
        return data || [];
      } catch (err: any) {
        console.error('❌ Ads error:', err.message);
        return []; // Return empty array on error, don't break the page
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Merge posts and ads based on position
  const itemsWithAds = useMemo(() => {
    if (!ads || ads.length === 0) {
      return allPosts.map((post: any) => ({ type: 'post', data: post }));
    }

    // Sort ads by position
    const sortedAds = [...ads].sort((a, b) => a.position - b.position);
    const result: Array<{ type: 'post' | 'ad'; data: any }> = [];
    const usedAdIndices = new Set<number>();

    // Track which ads have been inserted
    for (let i = 0; i < allPosts.length; i++) {
      // Check if we should insert an ad at this position
      for (let j = 0; j < sortedAds.length; j++) {
        if (usedAdIndices.has(j)) continue;

        const ad = sortedAds[j];
        // Insert ad at the beginning (position 0)
        if (ad.position === 0 && i === 0) {
          result.push({ type: 'ad', data: ad });
          usedAdIndices.add(j);
        }
        // Insert ad after specified number of posts
        else if (ad.position > 0 && i === ad.position) {
          result.push({ type: 'ad', data: ad });
          usedAdIndices.add(j);
        }
      }

      // Add the post
      result.push({ type: 'post', data: allPosts[i] });
    }

    // Add any remaining ads that should appear after all posts
    for (let j = 0; j < sortedAds.length; j++) {
      if (!usedAdIndices.has(j) && sortedAds[j].position >= allPosts.length) {
        result.push({ type: 'ad', data: sortedAds[j] });
      }
    }

    return result;
  }, [allPosts, ads]);

  // Group items for rendering: banner ads break the grid, everything else goes in grid
  const renderGroups = useMemo(() => {
    const groups: Array<{ type: 'grid' | 'banner'; items: typeof itemsWithAds }> = [];
    let currentGrid: typeof itemsWithAds = [];

    for (const item of itemsWithAds) {
      if (item.type === 'ad' && item.data.layout === 'BANNER') {
        // If we have items in current grid, save it
        if (currentGrid.length > 0) {
          groups.push({ type: 'grid', items: currentGrid });
          currentGrid = [];
        }
        // Add banner as separate group
        groups.push({ type: 'banner', items: [item] });
      } else {
        // Add to current grid
        currentGrid.push(item);
      }
    }

    // Add remaining grid items
    if (currentGrid.length > 0) {
      groups.push({ type: 'grid', items: currentGrid });
    }

    return groups;
  }, [itemsWithAds]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Enhanced Hero Section with rotating featured content */}
        <HeroSection />

        {/* Recommended Section (only visible when logged in and no active search) */}
        {!search && <RecommendedSection />}

        {/* Category Quick Filters */}
        <CategoryFilters
          selectedCategoryId={filters.categoryId}
          onCategorySelect={(categoryId) => {
            setFilters((prev) => ({ ...prev, categoryId }));
          }}
        />

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isError ? (
            <div className="text-center py-12">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-2xl mx-auto">
                <p className="text-red-800 dark:text-red-200 font-semibold mb-2">Error loading posts</p>
                <p className="text-red-600 dark:text-red-300 text-sm mb-4">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
                <details className="text-left text-xs text-red-600 dark:text-red-400">
                  <summary className="cursor-pointer mb-2">Technical Details</summary>
                  <pre className="bg-red-100 dark:bg-red-900/40 p-3 rounded overflow-auto">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </details>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              <p className="mt-4 text-slate-500 dark:text-slate-400">Duke ngarkuar...</p>
            </div>
          ) : allPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">Nuk ka rezultate</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              {/* View Toggle and Active Filters Row */}
              <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <ActiveFilters
                    filters={filters}
                    sortBy={sortBy}
                    onFilterRemove={(filterType) => {
                      if (filterType === 'price') {
                        setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' }));
                      } else if (filterType === 'sort') {
                        setSortBy('newest');
                      } else {
                        setFilters((prev) => ({ ...prev, [filterType]: '' }));
                      }
                    }}
                    onClearAll={() => {
                      setFilters({
                        categoryId: '',
                        locationId: '',
                        minPrice: '',
                        maxPrice: '',
                      });
                      setSortBy('newest');
                    }}
                  />
                </div>
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>
              
              <div className="space-y-6">
                {renderGroups.map((group, groupIndex) => {
                  if (group.type === 'banner') {
                    // Render banner ad full-width
                    const ad = group.items[0];
                    return (
                      <div key={`banner-${ad.data.id}-${groupIndex}`} className="w-full">
                        <AdBanner ad={ad.data} />
                      </div>
                    );
                  } else {
                    // Render grid or list with posts and card ads
                    const isListView = viewMode === 'list';
                    return (
                      <div
                        key={`${viewMode}-${groupIndex}`}
                        className={
                          isListView
                            ? 'space-y-4'
                            : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                        }
                      >
                        {group.items.map((item, itemIndex) => {
                          if (item.type === 'ad') {
                            // Ads only show in grid view
                            if (isListView) return null;
                            return <AdCard key={`ad-${item.data.id}-${itemIndex}`} ad={item.data} />;
                          }
                          return (
                            <ProductCard
                              key={item.data.id}
                              post={item.data}
                              showSaveButton={true}
                              viewMode={viewMode}
                            />
                          );
                        })}
                      </div>
                    );
                  }
                })}
              </div>

              {hasNextPage && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="btn-primary"
                  >
                    {isFetchingNextPage ? 'Duke ngarkuar...' : 'Shiko më shumë'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        sortBy={sortBy}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
      />
    </>
  );
}
