'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { MobileHeader } from '@/components/MobileHeader';
import { useAuth } from '@/contexts/AuthContext';
import { ProductCard } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { DocumentTextIcon, HeartIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Toast, useToast } from '@/components/admin/Toast';

type Tab = 'profile' | 'posts' | 'saved';

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { toast, showToast, hideToast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [isEditing, setIsEditing] = useState(false);

    const handleLogout = () => {
        if (confirm('A jeni të sigurt që dëshironi të dilni?')) {
            logout();
            router.push('/');
        }
    };

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
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch user's posts
    const { data: userPosts } = useQuery({
        queryKey: ['user-posts'],
        queryFn: async () => {
            const { data } = await api.get('/users/posts');
            return data;
        },
        enabled: activeTab === 'posts' && isAuthenticated,
        refetchOnWindowFocus: false,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Fetch saved posts
    const { data: savedPosts } = useQuery({
        queryKey: ['saved-posts'],
        queryFn: async () => {
            const { data } = await api.get('/users/saved');
            return data;
        },
        enabled: activeTab === 'saved' && isAuthenticated,
        refetchOnWindowFocus: false,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => api.patch('/users/profile', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setIsEditing(false);
            showToast('Profile updated successfully', 'success');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update profile';
            showToast(message, 'error');
        },
    });

    // Handle URL tab parameter
    useEffect(() => {
        const tab = searchParams.get('tab') as Tab;
        if (tab && ['profile', 'posts', 'saved'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Redirect if not logged in - but wait for auth to finish loading
    useEffect(() => {
        // Don't redirect while auth is still loading
        if (authLoading) return;
        
        // Only redirect if auth has finished loading and user is not authenticated
        if (!isAuthenticated && !profileLoading) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, authLoading, profileLoading, router]);

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
    if (authLoading || !isAuthenticated || profileLoading) {
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
            {/* Desktop: Full Navbar, Mobile: Just theme toggle */}
            <div className="hidden lg:block">
                <Navbar />
            </div>
            
            {/* Mobile Header with Logo and Logout */}
            <MobileHeader 
                title="Profile" 
                showBack={false} 
                showLogo={true}
                rightAction={
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Logout"
                        title="Dil nga Llogaria"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                }
            />

            <main className="bg-slate-50 dark:bg-slate-950 py-4 sm:py-8 pb-20 lg:pb-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Profile Header Card */}
                    <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl ring-4 ring-white dark:ring-slate-800">
                                    {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                                    <div className="inline-flex items-center gap-2">
                                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                                            {profile?.name || 'User'}
                                        </h1>
                                        {profile?.role === 'ADMIN' && (
                                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    {/* Admin Button - Mobile */}
                                    {profile?.role === 'ADMIN' && (
                                        <button
                                            onClick={() => router.push('/admin')}
                                            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Paneli Admin
                                        </button>
                                    )}
                                </div>
                                <p className="text-base text-slate-600 dark:text-slate-400 mb-4">
                                    {profile?.email}
                                </p>

                                {/* Stats */}
                                <div className="flex gap-3 justify-center sm:justify-start flex-wrap">
                                    <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                                        <DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                                {profile?._count?.posts || 0}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Postime</div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                                        <HeartIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                                {profile?._count?.savedPosts || 0}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Të Ruajtura</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 overflow-hidden">
                        <div className="flex border-b border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'profile'
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                    <span>Profili</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'posts'
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <DocumentTextIcon className="w-5 h-5" />
                                    <span>Postimet e Mia</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('saved')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'saved'
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <HeartIcon className="w-5 h-5" />
                                    <span>Të Ruajtura</span>
                                </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="mb-8">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                {/* Admin Access Card - Only on Desktop and for Admins */}
                                {profile?.role === 'ADMIN' && (
                                    <div className="hidden lg:block mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">Aksesi Admin</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">Menaxho përdoruesit, postimet dhe cilësimet</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push('/admin')}
                                                className="btn-primary"
                                            >
                                                Hap Panelin Admin
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Informacioni i Profilit</h2>
                                    <div className="flex gap-2">
                                        {!isEditing ? (
                                            <>
                                                <button onClick={() => setIsEditing(true)} className="btn-primary">
                                                    Ndrysho Profilin
                                                </button>
                                                {/* Desktop Logout Button */}
                                                <button
                                                    onClick={handleLogout}
                                                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                                >
                                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                                    Dil nga Llogaria
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={handleCancelEdit} className="btn-secondary">
                                                    Anulo
                                                </button>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={updateProfileMutation.isPending}
                                                    className="btn-primary disabled:opacity-50"
                                                >
                                                    {updateProfileMutation.isPending ? 'Duke ruajtur...' : 'Ruaj'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Emri</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input"
                                                placeholder="Vendos emrin tënd"
                                            />
                                        ) : (
                                            <p className="text-slate-900 dark:text-slate-100">{profile?.name || 'Nuk është vendosur'}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Telefoni</label>
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
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">WhatsApp</label>
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
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Instagram</label>
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
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Bio</label>
                                        {isEditing ? (
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="input"
                                                rows={4}
                                                placeholder="Trego diçka për veten..."
                                            />
                                        ) : (
                                            <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                                                {profile?.profile?.bio || 'Nuk është vendosur'}
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
                                            Gjithsej: {userPosts.total} postime
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {userPosts.posts.map((post: any) => (
                                                <ProductCard key={post.id} post={post} />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <DocumentTextIcon className="w-12 h-12 text-slate-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                            Ende Nuk Ke Postime
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                            Fillo të shesësh duke krijuar postimin e parë. Merr vetëm një minutë!
                                        </p>
                                        <button
                                            onClick={() => router.push('/posts/new')}
                                            className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Krijo Postimin e Parë
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
                                            Gjithsej: {savedPosts.total} postime të ruajtura
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {savedPosts.posts.map((post: any) => (
                                                <ProductCard key={post.id} post={post} showSaveButton />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <HeartIcon className="w-12 h-12 text-slate-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                            Nuk Ke Postime të Ruajtura
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                            Shfleto tregun dhe ruaj postimet që të pëlqejnë për akses të shpejtë!
                                        </p>
                                        <button
                                            onClick={() => router.push('/')}
                                            className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Shiko Postimet
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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

            <Footer />
        </>
    );
}
