'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { StatCard } from '@/components/admin/StatCard';
import { ThemeEditor } from '@/components/admin/ThemeEditor';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'posts' | 'ads' | 'theme'>('dashboard');
    const [isAdFormOpen, setIsAdFormOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<any>(null);

    // Redirect if not admin
    if (user && user.role !== 'ADMIN') {
        router.push('/');
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

    // Fetch users
    const { data: users } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await api.get('/admin/users');
            return data;
        },
        enabled: activeView === 'users',
    });

    // Fetch posts
    const { data: postsData } = useQuery({
        queryKey: ['admin-posts'],
        queryFn: async () => {
            const { data } = await api.get('/admin/posts');
            return data;
        },
        enabled: activeView === 'posts',
    });

    // Fetch ads
    const { data: adsData } = useQuery({
        queryKey: ['admin-ads'],
        queryFn: async () => {
            const { data } = await api.get('/ads/admin/all');
            return data;
        },
        enabled: activeView === 'ads',
    });

    // Update user role mutation
    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
            api.patch(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            alert('✓ User role updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to update role';
            alert(`Error: ${message}`);
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            alert('✓ User deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete user';
            alert(`Error: ${message}`);
        },
    });

    // Delete post mutation
    const deletePostMutation = useMutation({
        mutationFn: (postId: string) => api.delete(`/admin/posts/${postId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            alert('✓ Post deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete post';
            alert(`Error: ${message}`);
        },
    });

    // Reindex mutation
    const reindexMutation = useMutation({
        mutationFn: () => api.post('/admin/reindex'),
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to reindex';
            alert(`Error: ${message}`);
        },
    });

    // Create ad mutation
    const createAdMutation = useMutation({
        mutationFn: (adData: any) => api.post('/ads', adData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
            setIsAdFormOpen(false);
            setEditingAd(null);
            alert('✓ Ad created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to create ad';
            alert(`Error: ${message}`);
        },
    });

    // Update ad mutation
    const updateAdMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/ads/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
            setIsAdFormOpen(false);
            setEditingAd(null);
            alert('✓ Ad updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to update ad';
            alert(`Error: ${message}`);
        },
    });

    // Delete ad mutation
    const deleteAdMutation = useMutation({
        mutationFn: (adId: string) => api.delete(`/ads/${adId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
            alert('✓ Ad deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete ad';
            alert(`Error: ${message}`);
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

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <AdminSidebar activeView={activeView} onViewChange={setActiveView} />

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
                                    icon="👥"
                                    title="Total Users"
                                    value={stats.totalUsers}
                                />
                                <StatCard
                                    icon="📝"
                                    title="Total Posts"
                                    value={stats.totalPosts}
                                />
                                <StatCard
                                    icon="📅"
                                    title="Recent Posts"
                                    value={stats.recentPosts}
                                    trend="Last 7 days"
                                />
                                <StatCard
                                    icon="📊"
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
                                            className="w-full btn-primary disabled:opacity-50 text-left"
                                        >
                                            {reindexMutation.isPending ? '⏳ Reindexing...' : '🔄 Reindex All Posts'}
                                        </button>
                                        {reindexMutation.isSuccess && (
                                            <p className="text-green-600 text-sm">✓ Reindexing completed successfully</p>
                                        )}
                                        <button
                                            onClick={() => setActiveView('users')}
                                            className="w-full btn-secondary text-left"
                                        >
                                            👥 Manage Users
                                        </button>
                                        <button
                                            onClick={() => setActiveView('posts')}
                                            className="w-full btn-secondary text-left"
                                        >
                                            📝 Manage Posts
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Users View */}
                    {activeView === 'users' && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Users</h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Manage user accounts and permissions
                                </p>
                            </div>

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Posts
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {users?.map((u: any) => (
                                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 text-sm">{u.email}</td>
                                                    <td className="px-6 py-4 text-sm">{u.name || '-'}</td>
                                                    <td className="px-6 py-4 text-sm">
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
                                                    <td className="px-6 py-4 text-sm">{u._count.posts}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Delete user "${u.email}"? All their posts will also be deleted. This action cannot be undone.`)) {
                                                                    deleteUserMutation.mutate(u.id);
                                                                }
                                                            }}
                                                            disabled={u.id === user?.id || deleteUserMutation.isPending}
                                                            className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                                    Total: {postsData.total} posts
                                </p>
                            </div>

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {postsData.posts.map((post: any) => (
                                                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 text-sm font-medium max-w-xs truncate">
                                                        {post.title}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        €{Number(post.price).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{post.category?.name || '-'}</td>
                                                    <td className="px-6 py-4 text-sm">{post.user?.email || '-'}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Delete "${post.title}"? This action cannot be undone.`)) {
                                                                    deletePostMutation.mutate(post.id);
                                                                }
                                                            }}
                                                            disabled={deletePostMutation.isPending}
                                                            className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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

                    {/* Ads View */}
                    {activeView === 'ads' && (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Ads Management</h2>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Manage advertisements displayed between posts
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
                                            <h3 className="text-xl font-bold">
                                                {editingAd ? 'Edit Ad' : 'Create New Ad'}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setIsAdFormOpen(false);
                                                    setEditingAd(null);
                                                }}
                                                className="text-slate-500 hover:text-slate-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <form onSubmit={handleAdSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    defaultValue={editingAd?.title || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                                <input
                                                    type="url"
                                                    name="image"
                                                    defaultValue={editingAd?.image || ''}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Link URL (optional)</label>
                                                <input
                                                    type="url"
                                                    name="link"
                                                    defaultValue={editingAd?.link || ''}
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Position (0 = beginning, 5 = after 5 posts, etc.)</label>
                                                <input
                                                    type="number"
                                                    name="position"
                                                    min="0"
                                                    defaultValue={editingAd?.position ?? 0}
                                                    required
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Layout</label>
                                                <select
                                                    name="layout"
                                                    defaultValue={editingAd?.layout || 'CARD'}
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 text-slate-900 dark:text-white"
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
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Preview
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Layout
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Position
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Stats
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {adsData?.map((ad: any) => (
                                                <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4">
                                                        <img
                                                            src={ad.image}
                                                            alt={ad.title}
                                                            className="w-20 h-20 object-cover rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">{ad.title}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            ad.layout === 'BANNER'
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}>
                                                            {ad.layout || 'CARD'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {ad.position === 0 ? 'Beginning' : `After ${ad.position} posts`}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs ${
                                                                ad.active
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {ad.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="text-xs text-slate-500">
                                                            Views: {ad.viewCount || 0}<br />
                                                            Clicks: {ad.clickCount || 0}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingAd(ad);
                                                                    setIsAdFormOpen(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-700 font-medium"
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
                                                                className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {(!adsData || adsData.length === 0) && (
                                        <div className="text-center py-8 text-slate-500">
                                            No ads yet. Create your first ad!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Theme View */}
                    {activeView === 'theme' && <ThemeEditor />}
                </div>
            </main>
        </div>
    );
}
