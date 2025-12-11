'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MobileHeader } from '@/components/MobileHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileMenu } from '@/components/admin/AdminMobileMenu';
import { StatCard } from '@/components/admin/StatCard';
import { ThemeEditor } from '@/components/admin/ThemeEditor';
import { Toast, useToast } from '@/components/admin/Toast';
import { Pagination } from '@/components/admin/Pagination';
import Link from 'next/link';
import {
    UserGroupIcon,
    DocumentTextIcon,
    CalendarDaysIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast, showToast, hideToast } = useToast();
    const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'posts' | 'categories' | 'locations' | 'zones' | 'ads' | 'blacklist' | 'subscriptions' | 'theme'>('dashboard');
    const [isAdFormOpen, setIsAdFormOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<any>(null);
    const [postsPage, setPostsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [categoriesPage, setCategoriesPage] = useState(1);
    const [locationsPage, setLocationsPage] = useState(1);
    const [zonesPage, setZonesPage] = useState(1);
    const [adsPage, setAdsPage] = useState(1);
    const [blacklistPage, setBlacklistPage] = useState(1);
    const [subscriptionsPendingPage, setSubscriptionsPendingPage] = useState(1);
    const [subscriptionsActiveTab, setSubscriptionsActiveTab] = useState<'pending' | 'active'>('pending');
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<any>(null);
    const [isZoneFormOpen, setIsZoneFormOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<any>(null);
    const [newBlacklistWord, setNewBlacklistWord] = useState('');
    const [bulkBlacklistWords, setBulkBlacklistWords] = useState('');
    const [showBulkBlacklistModal, setShowBulkBlacklistModal] = useState(false);

    // Show loading while auth is loading
    if (authLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
            </>
        );
    }

    // Redirect if not admin
    if (user && user.role !== 'ADMIN') {
        router.push('/');
        return null;
    }

    // Redirect to login if not authenticated
    if (!user) {
        router.push('/auth/login');
        return null;
    }

    // Fetch statistics
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await api.get('/admin/stats');
            return data;
        },
    });

    // Fetch users with pagination
    const { data: usersData } = useQuery({
        queryKey: ['admin-users', usersPage],
        queryFn: async () => {
            const { data } = await api.get(`/admin/users?page=${usersPage}&limit=20`);
            return data;
        },
        enabled: activeView === 'users',
    });

    // Fetch posts with pagination
    const { data: postsData } = useQuery({
        queryKey: ['admin-posts', postsPage],
        queryFn: async () => {
            const { data } = await api.get(`/admin/posts?page=${postsPage}&limit=20`);
            return data;
        },
        enabled: activeView === 'posts',
    });

    // Fetch categories with pagination
    const { data: categoriesData } = useQuery({
        queryKey: ['admin-categories', categoriesPage],
        queryFn: async () => {
            const { data } = await api.get(`/admin/categories?page=${categoriesPage}&limit=20`);
            return data;
        },
        enabled: activeView === 'categories',
    });

    // Fetch locations with pagination
    const { data: locationsData } = useQuery({
        queryKey: ['admin-locations', locationsPage],
        queryFn: async () => {
            const { data } = await api.get(`/admin/locations?page=${locationsPage}&limit=20`);
            return data;
        },
        enabled: activeView === 'locations' || activeView === 'zones',
    });

    // Fetch zones with pagination
    const { data: zonesData } = useQuery({
        queryKey: ['admin-zones', zonesPage],
        queryFn: async () => {
            const { data } = await api.get(`/admin/zones?page=${zonesPage}&limit=20`);
            return data;
        },
        enabled: activeView === 'zones',
    });

    // Fetch ads with pagination
    const { data: adsData } = useQuery({
        queryKey: ['admin-ads', adsPage],
        queryFn: async () => {
            const { data } = await api.get(`/admin/ads?page=${adsPage}&limit=20`);
            return data;
        },
        enabled: activeView === 'ads',
    });

    // Fetch blacklist words
    const { data: blacklistData } = useQuery({
        queryKey: ['admin-blacklist', blacklistPage],
        queryFn: async () => {
            const { data } = await api.get(`/admin/blacklist?page=${blacklistPage}&limit=50`);
            return data;
        },
        enabled: activeView === 'blacklist',
    });

    // Fetch subscription requests
    const { data: subscriptionsData } = useQuery({
        queryKey: ['admin-subscriptions', subscriptionsActiveTab, subscriptionsPendingPage],
        queryFn: async () => {
            const endpoint = subscriptionsActiveTab === 'pending' 
                ? `/admin/subscriptions/pending?page=${subscriptionsPendingPage}&limit=20`
                : `/admin/subscriptions/active?page=${subscriptionsPendingPage}&limit=20`;
            const { data } = await api.get(endpoint);
            return data;
        },
        enabled: activeView === 'subscriptions',
    });

    // Update user role mutation
    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
            api.patch(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            showToast('User role updated successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to update role';
            showToast(message, 'error');
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            showToast('User deleted successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete user';
            showToast(message, 'error');
        },
    });

    // Delete post mutation
    const deletePostMutation = useMutation({
        mutationFn: (postId: string) => api.delete(`/admin/posts/${postId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            showToast('Post deleted successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete post';
            showToast(message, 'error');
        },
    });

    // Reindex mutation
    const reindexMutation = useMutation({
        mutationFn: () => api.post('/admin/reindex'),
        onSuccess: () => {
            showToast('Reindexing completed successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to reindex';
            showToast(message, 'error');
        },
    });

    // Create ad mutation
    const createAdMutation = useMutation({
        mutationFn: (adData: any) => api.post('/ads', adData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
            setIsAdFormOpen(false);
            setEditingAd(null);
            showToast('Ad created successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to create ad';
            showToast(message, 'error');
        },
    });

    // Update ad mutation
    const updateAdMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/ads/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
            setIsAdFormOpen(false);
            setEditingAd(null);
            showToast('Ad updated successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to update ad';
            showToast(message, 'error');
        },
    });

    // Delete ad mutation
    const deleteAdMutation = useMutation({
        mutationFn: (adId: string) => api.delete(`/ads/${adId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
            showToast('Ad deleted successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete ad';
            showToast(message, 'error');
        },
    });

    // Blacklist mutations
    const addBlacklistWordMutation = useMutation({
        mutationFn: (word: string) => api.post('/admin/blacklist', { word }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blacklist'] });
            showToast('Word added to blacklist', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to add word';
            showToast(message, 'error');
        },
    });

    const addBulkBlacklistMutation = useMutation({
        mutationFn: (words: string[]) => api.post('/admin/blacklist/bulk', { words }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blacklist'] });
            showToast('Words added to blacklist', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to add words';
            showToast(message, 'error');
        },
    });

    const deleteBlacklistWordMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/blacklist/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-blacklist'] });
            showToast('Word removed from blacklist', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to remove word';
            showToast(message, 'error');
        },
    });

    // Subscription mutations
    const approveSubscriptionMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/admin/subscriptions/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
            showToast('Subscription approved', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to approve subscription';
            showToast(message, 'error');
        },
    });

    const rejectSubscriptionMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/admin/subscriptions/${id}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
            showToast('Subscription rejected', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to reject subscription';
            showToast(message, 'error');
        },
    });

    // Category mutations
    const createCategoryMutation = useMutation({
        mutationFn: (categoryData: any) => api.post('/admin/categories', categoryData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            setIsCategoryFormOpen(false);
            setEditingCategory(null);
            showToast('Category created successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to create category';
            showToast(message, 'error');
        },
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/admin/categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            setIsCategoryFormOpen(false);
            setEditingCategory(null);
            showToast('Category updated successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to update category';
            showToast(message, 'error');
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: (categoryId: string) => api.delete(`/admin/categories/${categoryId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            showToast('Category deleted successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete category';
            showToast(message, 'error');
        },
    });

    // Location mutations
    const createLocationMutation = useMutation({
        mutationFn: (locationData: any) => api.post('/admin/locations', locationData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
            setIsLocationFormOpen(false);
            setEditingLocation(null);
            showToast('Location created successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to create location';
            showToast(message, 'error');
        },
    });

    const updateLocationMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/admin/locations/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
            setIsLocationFormOpen(false);
            setEditingLocation(null);
            showToast('Location updated successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to update location';
            showToast(message, 'error');
        },
    });

    const deleteLocationMutation = useMutation({
        mutationFn: (locationId: string) => api.delete(`/admin/locations/${locationId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
            showToast('Location deleted successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete location';
            showToast(message, 'error');
        },
    });

    // Zone mutations
    const createZoneMutation = useMutation({
        mutationFn: (zoneData: any) => api.post('/admin/zones', zoneData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-zones'] });
            setIsZoneFormOpen(false);
            setEditingZone(null);
            showToast('Zone created successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to create zone';
            showToast(message, 'error');
        },
    });

    const updateZoneMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/admin/zones/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-zones'] });
            setIsZoneFormOpen(false);
            setEditingZone(null);
            showToast('Zone updated successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to update zone';
            showToast(message, 'error');
        },
    });

    const deleteZoneMutation = useMutation({
        mutationFn: (zoneId: string) => api.delete(`/admin/zones/${zoneId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-zones'] });
            showToast('Zone deleted successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete zone';
            showToast(message, 'error');
        },
    });

    const handleAdSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const adData = {
            title: formData.get('title') as string,
            image: formData.get('image') as string,
            link: formData.get('link') as string || undefined,
            position: parseInt(formData.get('position') as string) || 0,
            layout: (formData.get('layout') as 'CARD' | 'BANNER') || 'CARD',
            active: formData.get('active') === 'on',
        };

        if (editingAd) {
            updateAdMutation.mutate({ id: editingAd.id, data: adData });
        } else {
            createAdMutation.mutate(adData);
        }
    };

    const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const categoryData = {
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
            icon: formData.get('icon') as string || undefined,
            description: formData.get('description') as string || undefined,
            parentId: formData.get('parentId') as string || undefined,
        };

        if (editingCategory) {
            updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryData });
        } else {
            createCategoryMutation.mutate(categoryData);
        }
    };

    const handleLocationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const locationData = {
            city: formData.get('city') as string,
            state: formData.get('state') as string || undefined,
            country: formData.get('country') as string || 'Albania',
            latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
            longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
            weight: formData.get('weight') ? parseInt(formData.get('weight') as string) : 0,
            hasZones: formData.get('hasZones') === 'on',
        };

        if (editingLocation) {
            updateLocationMutation.mutate({ id: editingLocation.id, data: locationData });
        } else {
            createLocationMutation.mutate(locationData);
        }
    };

    const handleZoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const zoneData = {
            name: formData.get('name') as string,
            locationId: formData.get('locationId') as string,
        };

        if (editingZone) {
            updateZoneMutation.mutate({ id: editingZone.id, data: zoneData });
        } else {
            createZoneMutation.mutate(zoneData);
        }
    };

    return (
        <>
            {/* Desktop: Full Navbar */}
            <div className="hidden lg:block">
                <Navbar hideSearch />
            </div>
            
            {/* Mobile: Simple Header */}
            <MobileHeader 
                title="Admin Panel" 
                showBack={false}
                rightAction={
                    <Link href="/" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                        Exit
                    </Link>
                }
            />

            <div className="flex h-screen bg-slate-50 dark:bg-slate-950 lg:pt-0">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                    <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
                </div>
                
                {/* Mobile Bottom Sheet Menu */}
                <AdminMobileMenu activeView={activeView} onViewChange={setActiveView} />

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Dashboard View */}
                    {activeView === 'dashboard' && stats && (
                        <>
                            {/* Page Header */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                    Dashboard
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Overview of your marketplace
                                </p>
                            </div>

                            {/* Stat Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    icon={<UserGroupIcon className="w-12 h-12" />}
                                    title="Total Users"
                                    value={stats.totalUsers}
                                />
                                <StatCard
                                    icon={<DocumentTextIcon className="w-12 h-12" />}
                                    title="Total Posts"
                                    value={stats.totalPosts}
                                />
                                <StatCard
                                    icon={<CalendarDaysIcon className="w-12 h-12" />}
                                    title="Recent Posts"
                                    value={stats.recentPosts}
                                    trend="Last 7 days"
                                />
                                <StatCard
                                    icon={<ChartBarIcon className="w-12 h-12" />}
                                    title="Categories"
                                    value={stats.postsByCategory?.length || 0}
                                />
                            </div>

                            {/* Posts by Category */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4">Posts by Category</h3>
                                    <div className="space-y-3">
                                        {stats.postsByCategory?.map((item: any) => (
                                            <div key={item.category} className="flex items-center justify-between">
                                                <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                                                <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                    {item.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => reindexMutation.mutate()}
                                            disabled={reindexMutation.isPending}
                                            className="w-full btn-primary disabled:opacity-50 text-left flex items-center gap-2"
                                        >
                                            {reindexMutation.isPending ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Reindexing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Reindex All Posts
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setActiveView('users')}
                                            className="w-full btn-secondary text-left flex items-center gap-2"
                                        >
                                            <UserGroupIcon className="w-4 h-4" />
                                            Manage Users
                                        </button>
                                        <button
                                            onClick={() => setActiveView('posts')}
                                            className="w-full btn-secondary text-left flex items-center gap-2"
                                        >
                                            <DocumentTextIcon className="w-4 h-4" />
                                            Manage Posts
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Users View */}
                    {activeView === 'users' && usersData && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Users</h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Total: {usersData.total} users | Page {usersData.page} of {usersData.totalPages}
                                </p>
                            </div>

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full font-sans">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Posts
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {usersData.users?.map((u: any) => (
                                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{u.email}</td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{u.name || '-'}</td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => {
                                                                const newRole = e.target.value as 'USER' | 'ADMIN';
                                                                if (confirm(`Change ${u.email} role to ${newRole}?`)) {
                                                                    updateRoleMutation.mutate({ userId: u.id, role: newRole });
                                                                } else {
                                                                    e.target.value = u.role;
                                                                }
                                                            }}
                                                            disabled={u.id === user?.id || updateRoleMutation.isPending}
                                                            className={`px-2 py-1 rounded text-xs border ${u.role === 'ADMIN'
                                                                    ? 'bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-300'
                                                                    : 'bg-gray-50 border-gray-300 text-slate-800 dark:bg-gray-800 dark:border-gray-600 dark:text-slate-300'
                                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            <option value="USER">USER</option>
                                                            <option value="ADMIN">ADMIN</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{u._count.posts}</td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Delete user "${u.email}"? All their posts will also be deleted. This action cannot be undone.`)) {
                                                                    deleteUserMutation.mutate(u.id);
                                                                }
                                                            }}
                                                            disabled={u.id === user?.id || deleteUserMutation.isPending}
                                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium font-sans"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Posts View */}
                    {activeView === 'posts' && postsData && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Posts</h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Total: {postsData.total} posts | Page {postsData.page} of {postsData.totalPages}
                                </p>
                            </div>

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full font-sans">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {postsData.posts.map((post: any) => (
                                                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 text-sm font-medium max-w-xs truncate font-sans text-slate-900 dark:text-slate-100">
                                                        {post.title}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">
                                                        €{Number(post.price).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{post.category?.name || '-'}</td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{post.user?.email || '-'}</td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Delete "${post.title}"? This action cannot be undone.`)) {
                                                                    deletePostMutation.mutate(post.id);
                                                                }
                                                            }}
                                                            disabled={deletePostMutation.isPending}
                                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium font-sans"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={postsData.page}
                                    totalPages={postsData.totalPages}
                                    total={postsData.total}
                                    onPageChange={setPostsPage}
                                />
                            </div>
                        </>
                    )}

                    {/* Ads View */}
                    {activeView === 'ads' && adsData && (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Ads Management</h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Total: {adsData.total} ads | Page {adsData.page} of {adsData.totalPages}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingAd(null);
                                        setIsAdFormOpen(true);
                                    }}
                                    className="btn-primary"
                                >
                                    + Create Ad
                                </button>
                            </div>

                            {/* Ad Form Modal */}
                            {isAdFormOpen && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                                {editingAd ? 'Edit Ad' : 'Create New Ad'}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setIsAdFormOpen(false);
                                                    setEditingAd(null);
                                                }}
                                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <form onSubmit={handleAdSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    defaultValue={editingAd?.title || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Image URL</label>
                                                <input
                                                    type="url"
                                                    name="image"
                                                    defaultValue={editingAd?.image || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Link URL (optional)</label>
                                                <input
                                                    type="url"
                                                    name="link"
                                                    defaultValue={editingAd?.link || ''}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Position (0 = beginning, 5 = after 5 posts, etc.)</label>
                                                <input
                                                    type="number"
                                                    name="position"
                                                    min="0"
                                                    defaultValue={editingAd?.position ?? 0}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Layout</label>
                                                <select
                                                    name="layout"
                                                    defaultValue={editingAd?.layout || 'CARD'}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                                                >
                                                    <option value="CARD">Card (Square, fits in grid)</option>
                                                    <option value="BANNER">Banner (Full-width horizontal)</option>
                                                </select>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    Card: Square format that fits in the product grid. Banner: Full-width horizontal ad that spans the entire row.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="active"
                                                    defaultChecked={editingAd?.active ?? true}
                                                    className="w-4 h-4"
                                                />
                                                <label className="text-sm font-medium text-slate-900 dark:text-white">Active</label>
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={createAdMutation.isPending || updateAdMutation.isPending}
                                                    className="btn-primary flex-1"
                                                >
                                                    {createAdMutation.isPending || updateAdMutation.isPending
                                                        ? 'Saving...'
                                                        : editingAd
                                                            ? 'Update Ad'
                                                            : 'Create Ad'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsAdFormOpen(false);
                                                        setEditingAd(null);
                                                    }}
                                                    className="btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full font-sans">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Preview
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Layout
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Position
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Stats
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {adsData.ads?.map((ad: any) => (
                                                <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4">
                                                        <img
                                                            src={ad.image}
                                                            alt={ad.title}
                                                            className="w-20 h-20 object-cover rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium font-sans text-slate-900 dark:text-slate-100">{ad.title}</td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium font-sans ${
                                                            ad.layout === 'BANNER'
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}>
                                                            {ad.layout || 'CARD'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">
                                                        {ad.position === 0 ? 'Beginning' : `After ${ad.position} posts`}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-sans ${
                                                                ad.active
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {ad.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                                                            Views: {ad.viewCount || 0}<br />
                                                            Clicks: {ad.clickCount || 0}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingAd(ad);
                                                                    setIsAdFormOpen(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium font-sans"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Delete ad "${ad.title}"?`)) {
                                                                        deleteAdMutation.mutate(ad.id);
                                                                    }
                                                                }}
                                                                disabled={deleteAdMutation.isPending}
                                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium font-sans"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {(!adsData.ads || adsData.ads.length === 0) && (
                                        <div className="text-center py-8 text-slate-500 dark:text-slate-400 font-sans">
                                            No ads yet. Create your first ad!
                                        </div>
                                    )}
                                </div>
                                <Pagination
                                    currentPage={adsData.page}
                                    totalPages={adsData.totalPages}
                                    total={adsData.total}
                                    onPageChange={setAdsPage}
                                />
                            </div>
                        </>
                    )}

                    {/* Categories View */}
                    {activeView === 'categories' && categoriesData && (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Categories</h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Total: {categoriesData.total} categories | Page {categoriesData.page} of {categoriesData.totalPages}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setIsCategoryFormOpen(true);
                                    }}
                                    className="btn-primary"
                                >
                                    + Create Category
                                </button>
                            </div>

                            {/* Category Form Modal */}
                            {isCategoryFormOpen && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setIsCategoryFormOpen(false);
                                                    setEditingCategory(null);
                                                }}
                                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    defaultValue={editingCategory?.name || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Slug</label>
                                                <input
                                                    type="text"
                                                    name="slug"
                                                    defaultValue={editingCategory?.slug || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Icon (emoji or text)</label>
                                                <input
                                                    type="text"
                                                    name="icon"
                                                    defaultValue={editingCategory?.icon || ''}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Description</label>
                                                <textarea
                                                    name="description"
                                                    defaultValue={editingCategory?.description || ''}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Parent Category (optional)</label>
                                                <select
                                                    name="parentId"
                                                    defaultValue={editingCategory?.parentId || ''}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                                                >
                                                    <option value="">None (Top-level category)</option>
                                                    {/* Note: This shows all categories, not just current page. For better UX, you might want to fetch all categories separately for the dropdown */}
                                                    {categoriesData?.categories?.filter((c: any) => !c.parentId && c.id !== editingCategory?.id).map((cat: any) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                                                    className="btn-primary flex-1"
                                                >
                                                    {createCategoryMutation.isPending || updateCategoryMutation.isPending
                                                        ? 'Saving...'
                                                        : editingCategory
                                                            ? 'Update Category'
                                                            : 'Create Category'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCategoryFormOpen(false);
                                                        setEditingCategory(null);
                                                    }}
                                                    className="btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full font-sans">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Icon
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Slug
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Parent
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Posts
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {categoriesData.categories?.map((category: any) => (
                                                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">
                                                        {category.icon || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium font-sans text-slate-900 dark:text-slate-100">
                                                        {category.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{category.slug}</td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">
                                                        {category.parent?.name || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{category._count?.posts || 0}</td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCategory(category);
                                                                    setIsCategoryFormOpen(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium font-sans"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
                                                                        deleteCategoryMutation.mutate(category.id);
                                                                    }
                                                                }}
                                                                disabled={deleteCategoryMutation.isPending}
                                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium font-sans"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={categoriesData.page}
                                    totalPages={categoriesData.totalPages}
                                    total={categoriesData.total}
                                    onPageChange={setCategoriesPage}
                                />
                            </div>
                        </>
                    )}

                    {/* Locations View */}
                    {activeView === 'locations' && locationsData && (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Locations</h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Total: {locationsData.total} locations | Page {locationsData.page} of {locationsData.totalPages}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingLocation(null);
                                        setIsLocationFormOpen(true);
                                    }}
                                    className="btn-primary"
                                >
                                    + Create Location
                                </button>
                            </div>

                            {/* Location Form Modal */}
                            {isLocationFormOpen && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                                {editingLocation ? 'Edit Location' : 'Create New Location'}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setIsLocationFormOpen(false);
                                                    setEditingLocation(null);
                                                }}
                                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <form onSubmit={handleLocationSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    defaultValue={editingLocation?.city || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">State/Region (optional)</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    defaultValue={editingLocation?.state || ''}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Country</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    defaultValue={editingLocation?.country || 'Albania'}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Latitude (optional)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        name="latitude"
                                                        defaultValue={editingLocation?.latitude || ''}
                                                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Longitude (optional)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        name="longitude"
                                                        defaultValue={editingLocation?.longitude || ''}
                                                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Weight (for ordering, higher = more important)</label>
                                                <input
                                                    type="number"
                                                    name="weight"
                                                    defaultValue={editingLocation?.weight ?? 0}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="hasZones"
                                                    defaultChecked={editingLocation?.hasZones ?? false}
                                                    className="w-4 h-4"
                                                />
                                                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Has Zones</label>
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={createLocationMutation.isPending || updateLocationMutation.isPending}
                                                    className="btn-primary flex-1"
                                                >
                                                    {createLocationMutation.isPending || updateLocationMutation.isPending
                                                        ? 'Saving...'
                                                        : editingLocation
                                                            ? 'Update Location'
                                                            : 'Create Location'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsLocationFormOpen(false);
                                                        setEditingLocation(null);
                                                    }}
                                                    className="btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full font-sans">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    City
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Country
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Weight
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Has Zones
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Posts
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {locationsData.locations?.map((location: any) => (
                                                <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 text-sm font-medium font-sans text-slate-900 dark:text-slate-100">
                                                        {location.city}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{location.country}</td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{location.weight}</td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <span className={`px-2 py-1 rounded text-xs font-sans ${
                                                            location.hasZones
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                        }`}>
                                                            {location.hasZones ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{location._count?.posts || 0}</td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingLocation(location);
                                                                    setIsLocationFormOpen(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium font-sans"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Delete location "${location.city}"? This action cannot be undone.`)) {
                                                                        deleteLocationMutation.mutate(location.id);
                                                                    }
                                                                }}
                                                                disabled={deleteLocationMutation.isPending}
                                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium font-sans"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={locationsData.page}
                                    totalPages={locationsData.totalPages}
                                    total={locationsData.total}
                                    onPageChange={setLocationsPage}
                                />
                            </div>
                        </>
                    )}

                    {/* Zones View */}
                    {activeView === 'zones' && zonesData && (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Zones</h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Total: {zonesData.total} zones | Page {zonesData.page} of {zonesData.totalPages}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingZone(null);
                                        setIsZoneFormOpen(true);
                                    }}
                                    className="btn-primary"
                                >
                                    + Create Zone
                                </button>
                            </div>

                            {/* Zone Form Modal */}
                            {isZoneFormOpen && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                                {editingZone ? 'Edit Zone' : 'Create New Zone'}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setIsZoneFormOpen(false);
                                                    setEditingZone(null);
                                                }}
                                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <form onSubmit={handleZoneSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Zone Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    defaultValue={editingZone?.name || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-slate-100">Location (City)</label>
                                                <select
                                                    name="locationId"
                                                    defaultValue={editingZone?.locationId || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                                                >
                                                    <option value="">Select a location...</option>
                                                    {locationsData?.locations?.map((loc: any) => (
                                                        <option key={loc.id} value={loc.id}>{loc.city}, {loc.country}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={createZoneMutation.isPending || updateZoneMutation.isPending}
                                                    className="btn-primary flex-1"
                                                >
                                                    {createZoneMutation.isPending || updateZoneMutation.isPending
                                                        ? 'Saving...'
                                                        : editingZone
                                                            ? 'Update Zone'
                                                            : 'Create Zone'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsZoneFormOpen(false);
                                                        setEditingZone(null);
                                                    }}
                                                    className="btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full font-sans">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Zone Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Location
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Posts
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400 font-sans">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {zonesData.zones?.map((zone: any) => (
                                                <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 text-sm font-medium font-sans text-slate-900 dark:text-slate-100">
                                                        {zone.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">
                                                        {zone.location?.city}, {zone.location?.country}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-sans text-slate-900 dark:text-slate-100">{zone._count?.posts || 0}</td>
                                                    <td className="px-6 py-4 text-sm font-sans">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingZone(zone);
                                                                    setIsZoneFormOpen(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium font-sans"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Delete zone "${zone.name}"? This action cannot be undone.`)) {
                                                                        deleteZoneMutation.mutate(zone.id);
                                                                    }
                                                                }}
                                                                disabled={deleteZoneMutation.isPending}
                                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium font-sans"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={zonesData.page}
                                    totalPages={zonesData.totalPages}
                                    total={zonesData.total}
                                    onPageChange={setZonesPage}
                                />
                            </div>
                        </>
                    )}

                    {/* Blacklist View */}
                    {activeView === 'blacklist' && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Fjalë të Ndaluara
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Menaxho fjalët që nuk lejohen në postime dhe mesazhe
                                </p>
                            </div>

                            {/* Add Word Form */}
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-6">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (newBlacklistWord.trim()) {
                                        addBlacklistWordMutation.mutate(newBlacklistWord.trim().toLowerCase());
                                        setNewBlacklistWord('');
                                    }
                                }} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newBlacklistWord}
                                        onChange={(e) => setNewBlacklistWord(e.target.value)}
                                        placeholder="Shto fjalë të re..."
                                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newBlacklistWord.trim()}
                                        className="btn-primary"
                                    >
                                        Shto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkBlacklistModal(true)}
                                        className="btn-secondary"
                                    >
                                        Ngarko Shumë
                                    </button>
                                </form>
                            </div>

                            {/* Words Table */}
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                                Fjala
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                                Data e Shtuar
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                                Veprime
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                        {blacklistData?.words?.map((word: any) => (
                                            <tr key={word.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                                    {word.word}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                    {new Date(word.createdAt).toLocaleDateString('sq-AL')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Jeni i sigurt që dëshironi ta fshini këtë fjalë?')) {
                                                                deleteBlacklistWordMutation.mutate(word.id);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {blacklistData && blacklistData.totalPages > 1 && (
                                <Pagination
                                    currentPage={blacklistPage}
                                    totalPages={blacklistData.totalPages}
                                    total={blacklistData.total}
                                    onPageChange={setBlacklistPage}
                                />
                            )}

                            {/* Bulk Upload Modal */}
                            {showBulkBlacklistModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full p-6">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                            Ngarko Shumë Fjalë
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                            Shkruaj një fjalë për linjë. Fjalët do të konvertohen automatikisht në shkronja të vogla.
                                        </p>
                                        <textarea
                                            value={bulkBlacklistWords}
                                            onChange={(e) => setBulkBlacklistWords(e.target.value)}
                                            placeholder="fjala1&#10;fjala2&#10;fjala3"
                                            rows={10}
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowBulkBlacklistModal(false);
                                                    setBulkBlacklistWords('');
                                                }}
                                                className="btn-secondary"
                                            >
                                                Anulo
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const words = bulkBlacklistWords
                                                        .split('\n')
                                                        .map((w) => w.trim().toLowerCase())
                                                        .filter((w) => w.length > 0);
                                                    if (words.length > 0) {
                                                        addBulkBlacklistMutation.mutate(words);
                                                        setShowBulkBlacklistModal(false);
                                                        setBulkBlacklistWords('');
                                                    }
                                                }}
                                                disabled={!bulkBlacklistWords.trim()}
                                                className="btn-primary"
                                            >
                                                Shto {bulkBlacklistWords.split('\n').filter(w => w.trim()).length} Fjalë
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Subscriptions View */}
                    {activeView === 'subscriptions' && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Menaxhimi i Abonimeve
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Miraton ose refuzon kërkesat për përmirësim plani
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSubscriptionsActiveTab('pending')}
                                        className={`pb-3 px-4 border-b-2 font-medium transition-colors ${
                                            subscriptionsActiveTab === 'pending'
                                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        Në Pritje
                                    </button>
                                    <button
                                        onClick={() => setSubscriptionsActiveTab('active')}
                                        className={`pb-3 px-4 border-b-2 font-medium transition-colors ${
                                            subscriptionsActiveTab === 'active'
                                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                                : 'border-transparent text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        Aktive
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            {subscriptionsActiveTab === 'pending' && (
                                <div className="space-y-4">
                                    {subscriptionsData?.requests?.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                            Nuk ka kërkesa në pritje
                                        </div>
                                    ) : (
                                        subscriptionsData?.requests?.map((request: any) => (
                                            <div
                                                key={request.id}
                                                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                            {request.user.name || request.user.email}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {request.user.email}
                                                        </p>
                                                        <div className="mt-2">
                                                            <span className="text-sm">Plani Aktual: </span>
                                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                                                                {request.user.subscription}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="text-sm">Plani i Kërkuar: </span>
                                                            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                                                                {request.plan}
                                                            </span>
                                                        </div>
                                                        {request.notes && (
                                                            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                                                {request.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Jeni i sigurt që dëshironi ta miratoni këtë kërkesë?')) {
                                                                    approveSubscriptionMutation.mutate(request.id);
                                                                }
                                                            }}
                                                            className="btn-primary"
                                                        >
                                                            Miraton
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Jeni i sigurt që dëshironi ta refuzoni këtë kërkesë?')) {
                                                                    rejectSubscriptionMutation.mutate(request.id);
                                                                }
                                                            }}
                                                            className="btn-secondary"
                                                        >
                                                            Refuzon
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {subscriptionsActiveTab === 'active' && (
                                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                                    Përdoruesi
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                                    Plani
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                                    Skadon Më
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {subscriptionsData?.subscriptions?.map((sub: any) => (
                                                <tr key={sub.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {sub.name || sub.email}
                                                            </div>
                                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                                {sub.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm">
                                                            {sub.subscription}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                        {sub.subscriptionEndsAt
                                                            ? new Date(sub.subscriptionEndsAt).toLocaleDateString('sq-AL')
                                                            : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {subscriptionsData && subscriptionsData.totalPages > 1 && (
                                <Pagination
                                    currentPage={subscriptionsPendingPage}
                                    totalPages={subscriptionsData.totalPages}
                                    total={subscriptionsData.total}
                                    onPageChange={setSubscriptionsPendingPage}
                                />
                            )}
                        </>
                    )}

                    {/* Theme View */}
                    {activeView === 'theme' && <ThemeEditor />}
                </div>
            </main>

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </div>
        </>
    );
}
