'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Post } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
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

export const dynamic = 'force-dynamic';

function HomeContent() {
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
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [clickedPostIds, setClickedPostIds] = useState<Set<string>>(new Set());
  
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

  // Sync search state with URL query param - only update when URL actually changes
  const prevUrlQueryRef = React.useRef(urlQuery);
  useEffect(() => {
    const newSearch = urlQuery || '';
    // Only update if URL query actually changed
    if (prevUrlQueryRef.current !== newSearch) {
      prevUrlQueryRef.current = newSearch;
      setSearch(newSearch);
      
      // Reset interaction tracking when search changes
      setSearchStartTime(Date.now());
      setClickedPostIds(new Set());
    }
  }, [urlQuery]);

  // Track search interaction when component unmounts or search changes
  useEffect(() => {
    return () => {
      // Send interaction data when leaving the page
      if (searchStartTime && (urlQuery || filters.categoryId || filters.locationId)) {
        const dwellTime = Math.floor((Date.now() - searchStartTime) / 1000); // in seconds
        const clickedIds = Array.from(clickedPostIds);
        
        if (dwellTime > 0 || clickedIds.length > 0) {
          // Send interaction data asynchronously (don't block navigation)
          api.post('/search/interaction', {
            query: urlQuery || '',
            categoryId: filters.categoryId || undefined,
            locationId: filters.locationId || undefined,
            clickedResults: clickedIds,
            dwellTime,
          }).catch(() => {
            // Silently fail - interaction tracking is not critical
          });
        }
      }
    };
  }, [searchStartTime, clickedPostIds, urlQuery, filters.categoryId, filters.locationId]);

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


  // CRITICAL FIX: Memoize query key to prevent object reference changes from causing refetches
  const queryKey = useMemo(() => {
    // Serialize filters object to a stable string representation
    const filtersKey = JSON.stringify({
      categoryId: filters.categoryId || '',
      locationId: filters.locationId || '',
      minPrice: filters.minPrice || '',
      maxPrice: filters.maxPrice || '',
    });
    return ['posts', search.trim(), filtersKey, sortBy];
  }, [search, filters.categoryId, filters.locationId, filters.minPrice, filters.maxPrice, sortBy]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, isError } = useInfiniteQuery({
    queryKey,
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
        const responseData = response.data || {};
        
        // Ensure we always return a valid structure
        return {
          hits: responseData.hits || [],
          total: responseData.total || 0,
        };
      } catch (err: any) {
        // Return empty result instead of throwing to prevent page crash
        return { hits: [], total: 0 };
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hits || lastPage.hits.length === 0) return undefined;
      const lastItem = lastPage.hits[lastPage.hits.length - 1];
      return lastItem?.sort || undefined;
    },
    initialPageParam: undefined,
    staleTime: 30 * 1000, // Cache for 30 seconds (reduces unnecessary refetches)
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    enabled: true, // Always enabled
    retry: 2, // Retry failed requests
  });

  // Safely extract posts from all pages
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page: any) => {
      if (!page || !page.hits) return [];
      return page.hits.filter((hit: any) => hit && hit.id); // Filter out invalid hits
    });
  }, [data]);

  // Fetch active ads
  const { data: ads } = useQuery({
    queryKey: ['ads', 'active'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/ads?activeOnly=true');
        return data || [];
      } catch (err: any) {
        return []; // Return empty array on error, don't break the page
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Merge posts and ads with smart distribution (like Facebook Marketplace)
  const itemsWithAds = useMemo(() => {
    if (!ads || ads.length === 0) {
      return allPosts.map((post: any) => ({ type: 'post', data: post }));
    }

    // Separate banner ads and card ads
    const bannerAds = ads.filter((ad: any) => ad.layout === 'BANNER' && ad.active);
    const cardAds = ads.filter((ad: any) => ad.layout === 'CARD' && ad.active);
    
    // Shuffle card ads for variety (but keep banner order)
    const shuffledCardAds = [...cardAds].sort((_a: any, _b: any) => Math.random() - 0.5);
    
    const result: Array<{ type: 'post' | 'ad'; data: any }> = [];
    let cardAdIndex = 0;
    let bannerAdIndex = 0;
    
    // Smart ad insertion: use adaptive intervals based on post count
    // For few posts: insert ads more frequently to avoid grouping at end
    // For many posts: use longer intervals for natural distribution
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    let AD_INTERVAL_MIN: number;
    let AD_INTERVAL_MAX: number;
    
    if (allPosts.length <= 10) {
      // Few posts: insert ads every 3-5 posts to ensure distribution
      AD_INTERVAL_MIN = 3;
      AD_INTERVAL_MAX = 5;
    } else if (allPosts.length <= 30) {
      // Medium posts: insert ads every 5-7 posts
      AD_INTERVAL_MIN = isMobile ? 6 : 5;
      AD_INTERVAL_MAX = isMobile ? 9 : 7;
    } else {
      // Many posts: insert ads every 6-10 posts (longer on mobile)
      AD_INTERVAL_MIN = isMobile ? 8 : 6;
      AD_INTERVAL_MAX = isMobile ? 12 : 10;
    }
    
    let postsSinceLastAd = 0;
    let nextAdInterval = AD_INTERVAL_MIN + Math.floor(Math.random() * (AD_INTERVAL_MAX - AD_INTERVAL_MIN + 1));
    
    // Calculate banner ad positions (only if we have enough posts)
    const bannerPositions: number[] = [];
    if (allPosts.length > 10) {
      bannerPositions.push(0); // Beginning
      if (allPosts.length > 20) {
        bannerPositions.push(Math.floor(allPosts.length / 3)); // First third
      }
      if (allPosts.length > 30) {
        bannerPositions.push(Math.floor(allPosts.length * 2 / 3)); // Second third
      }
    }
    const usedBannerPositions = new Set<number>();
    
    // Calculate max ads to insert (ensure we don't have more ads than posts)
    const maxCardAds = Math.min(
      shuffledCardAds.length,
      Math.max(1, Math.floor(allPosts.length / AD_INTERVAL_MIN)) // At least 1 ad if we have posts
    );
    
    // Process posts and insert ads naturally
    for (let postIndex = 0; postIndex < allPosts.length; postIndex++) {
      // Check if we should insert a banner ad at this position
      const shouldInsertBanner = bannerPositions.includes(postIndex) && 
                                 !usedBannerPositions.has(postIndex) &&
                                 bannerAdIndex < bannerAds.length;
      
      if (shouldInsertBanner) {
        result.push({ type: 'ad', data: bannerAds[bannerAdIndex] });
        bannerAdIndex++;
        usedBannerPositions.add(postIndex);
        // Reset counter after banner (banner counts as content break)
        postsSinceLastAd = 0;
      }
      
      // Insert card ad at regular intervals (but not if we just inserted a banner)
      const shouldInsertCardAd = !shouldInsertBanner && 
                                 cardAdIndex < maxCardAds &&
                                 postsSinceLastAd >= nextAdInterval;
      
      if (shouldInsertCardAd) {
        result.push({ type: 'ad', data: shuffledCardAds[cardAdIndex] });
        cardAdIndex++;
        postsSinceLastAd = 0;
        // Randomize next interval for natural distribution
        nextAdInterval = AD_INTERVAL_MIN + Math.floor(Math.random() * (AD_INTERVAL_MAX - AD_INTERVAL_MIN + 1));
      }
      
      // Always add the post
      result.push({ type: 'post', data: allPosts[postIndex] });
      postsSinceLastAd++;
    }

    // Don't add remaining ads at the end - this was causing the grouping issue
    // Ads should be naturally distributed throughout, not bunched at the end

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
                            ? 'space-y-3'
                            : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
                        }
                      >
                        {group.items.map((item, itemIndex) => {
                          if (item.type === 'ad') {
                            // Ads only show in grid view
                            if (isListView) return null;
                            return <AdCard key={`ad-${item.data.id}-${itemIndex}`} ad={item.data} />;
                          }
                          return (
                            <div
                              key={item.data.id}
                              onClick={() => {
                                setClickedPostIds((prev) => new Set([...prev, item.data.id]));
                              }}
                            >
                              <ProductCard
                                post={item.data}
                                showSaveButton={true}
                                viewMode={viewMode}
                              />
                            </div>
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

      {/* Floating Filter Button - Mobile Only */}
      <button
        onClick={() => setIsFilterOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Open filters"
      >
        <AdjustmentsHorizontalIcon className="w-6 h-6" />
      </button>

      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900" />}>
        <Navbar />
      </Suspense>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </>
  );
}
