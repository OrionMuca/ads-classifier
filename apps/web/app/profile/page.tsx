'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ProductCard } from '@/components/ProductCard';
import { useRouter } from 'next/navigation';

type Tab = 'profile' | 'posts' | 'saved';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        bio: '',
    });

    // Fetch user profile
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const { data } = await api.get('/users/profile');
            // Set form data when profile loads
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                whatsapp: data.profile?.whatsapp || '',
                instagram: data.profile?.instagram || '',
                bio: data.profile?.bio || '',
            });
            return data;
        },
        enabled: isAuthenticated,
    });

    // Fetch user's posts
    const { data: userPosts } = useQuery({
        queryKey: ['user-posts'],
        queryFn: async () => {
            const { data } = await api.get('/users/posts');
            return data;
        },
        enabled: activeTab === 'posts' && isAuthenticated,
    });

    // Fetch saved posts
    const { data: savedPosts } = useQuery({
        queryKey: ['saved-posts'],
        queryFn: async () => {
            const { data } = await api.get('/users/saved');
            return data;
        },
        enabled: activeTab === 'saved' && isAuthenticated,
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => api.patch('/users/profile', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setIsEditing(false);
            alert('✓ Profile updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update profile';
            alert(`Error: ${message}`);
        },
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, router]);

    const handleSaveProfile = () => {
        updateProfileMutation.mutate(formData);
    };

    const handleCancelEdit = () => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
                whatsapp: profile.profile?.whatsapp || '',
                instagram: profile.profile?.instagram || '',
                bio: profile.profile?.bio || '',
            });
        }
        setIsEditing(false);
    };

    // Show loading or redirect state 
    if (!isAuthenticated || profileLoading) {
        return (
            <>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-32 bg-slate-200 dark:bg-gray-800 rounded-lg mb-4"></div>
                        <div className="h-64 bg-slate-200 dark:bg-gray-800 rounded-lg"></div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Profile Header Card */}
                <div className="card mb-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                                {profile?.name || 'No name'}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 mb-3">{profile?.email}</p>

                            {/* Stats */}
                            <div className="flex gap-4">
                                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        📝 {profile?._count?.posts || 0} Posts
                                    </span>
                                </div>
                                <div className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-full">
                                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                        ❤️ {profile?._count?.savedPosts || 0} Saved
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 sm:gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 -mb-px text-sm font-medium whitespace-nowrap ${activeTab === 'profile'
                            ? 'border-b-2 border-blue-600 text-primary-600'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-4 py-2 -mb-px text-sm font-medium whitespace-nowrap ${activeTab === 'posts'
                            ? 'border-b-2 border-blue-600 text-primary-600'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        My Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-2 -mb-px text-sm font-medium whitespace-nowrap ${activeTab === 'saved'
                            ? 'border-b-2 border-blue-600 text-primary-600'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Saved Posts
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mb-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="card">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Profile Information</h2>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="btn-primary">
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={handleCancelEdit} className="btn-secondary">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={updateProfileMutation.isPending}
                                            className="btn-primary disabled:opacity-50"
                                        >
                                            {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input"
                                            placeholder="Enter your name"
                                        />
                                    ) : (
                                        <p className="text-slate-900 dark:text-slate-100">{profile?.name || 'Not set'}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="input"
                                            placeholder="+355 69 123 4567"
                                        />
                                    ) : (
                                        <p className="text-slate-900 dark:text-slate-100">{profile?.phone}</p>
                                    )}
                                </div>

                                {/* WhatsApp */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">WhatsApp</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="input"
                                            placeholder="+355 69 123 4567"
                                        />
                                    ) : (
                                        <p className="text-slate-900 dark:text-slate-100">
                                            {profile?.profile?.whatsapp || 'Not set'}
                                        </p>
                                    )}
                                </div>

                                {/* Instagram */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Instagram</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.instagram}
                                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            className="input"
                                            placeholder="@username"
                                        />
                                    ) : (
                                        <p className="text-slate-900 dark:text-slate-100">
                                            {profile?.profile?.instagram || 'Not set'}
                                        </p>
                                    )}
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="input"
                                            rows={4}
                                            placeholder="Tell us about yourself..."
                                        />
                                    ) : (
                                        <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                                            {profile?.profile?.bio || 'Not set'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Posts Tab */}
                    {activeTab === 'posts' && (
                        <div>
                            {userPosts?.posts?.length > 0 ? (
                                <>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        Total: {userPosts.total} posts
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {userPosts.posts.map((post: any) => (
                                            <ProductCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="card text-center py-12">
                                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                                        You haven't posted anything yet
                                    </p>
                                    <button
                                        onClick={() => router.push('/posts/new')}
                                        className="btn-primary"
                                    >
                                        Create Your First Post
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Saved Posts Tab */}
                    {activeTab === 'saved' && (
                        <div>
                            {savedPosts?.posts?.length > 0 ? (
                                <>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        Total: {savedPosts.total} saved posts
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {savedPosts.posts.map((post: any) => (
                                            <ProductCard key={post.id} post={post} showSaveButton />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="card text-center py-12">
                                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                                        No saved posts yet
                                    </p>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Browse the marketplace and save posts you like!
                                    </p>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="btn-primary"
                                    >
                                        Browse Posts
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
