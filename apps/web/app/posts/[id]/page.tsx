'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageGallery } from '@/components/ImageGallery';
import { useAuth } from '@/contexts/AuthContext';
import { ContactSellerModal } from '@/components/ContactSellerModal';
import { RelatedProducts } from '@/components/RelatedProducts';
import { CategoryIcon } from '@/lib/category-icons';
import { MapPinIcon } from '@heroicons/react/24/outline';

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const postId = params.id as string;
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const { data: post, isLoading, error } = useQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
            try {
                const { data } = await api.get(`/posts/${postId}`);
                return data;
            } catch (error: any) {
                // If post not found, return null instead of throwing
                if (error.response?.status === 404) {
                    return null;
                }
                throw error;
            }
        },
        retry: 1, // Only retry once
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus
    });

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error || (!isLoading && !post)) {
        return (
            <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Post not found</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        The post you're looking for doesn't exist or may have been removed.
                    </p>
                    <Link
                        href="/"
                        className="btn-primary inline-block"
                    >
                        Back to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8 w-full pb-20 lg:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                    {/* Image Gallery */}
                    <div className="w-full min-w-0">
                        <ImageGallery images={post.images || []} title={post.title} />
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex-1 text-slate-900 dark:text-white">{post.title}</h1>
                            {user?.id === post.userId && (
                                <Link
                                    href={`/posts/${postId}/edit`}
                                    className="ml-4 p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Edit post"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </Link>
                            )}
                        </div>

                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-4 sm:mb-6">
                            €{Number(post.price).toLocaleString()}
                        </p>

                        <div className="flex gap-4 mb-6 flex-wrap">
                            {post.category && (
                                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <CategoryIcon categoryName={post.category.name} className="w-5 h-5" />
                                    {post.category.name}
                                </span>
                            )}
                            {post.location?.city && (
                                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <MapPinIcon className="w-5 h-5" />
                                    {post.location.city}
                                </span>
                            )}
                        </div>

                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-slate-900 dark:text-white">Description</h2>
                            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {post.description}
                            </p>
                        </div>

                        {/* Seller Info */}
                        <div className="card p-6 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Seller Information</h3>
                            <p className="text-slate-900 dark:text-white">
                                {post.user?.name || 'Anonymous User'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {post.user?.email}
                            </p>
                        </div>

                        {/* Show contact button only for other users' posts */}
                        {user?.id !== post.userId && (
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="w-full btn-primary py-4 text-lg text-white"
                            >
                                Contact Seller
                            </button>
                        )}

                        {/* Show edit button for own posts */}
                        {user?.id === post.userId && (
                            <Link
                                href={`/posts/${postId}/edit`}
                                className="w-full btn-primary py-4 text-lg text-white text-center block"
                            >
                                Edit Post
                            </Link>
                        )}

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                            Posted on {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Contact Seller Modal */}
                {post.user && (
                    <ContactSellerModal
                        isOpen={isContactModalOpen}
                        onClose={() => setIsContactModalOpen(false)}
                        seller={post.user}
                        productTitle={post.title}
                    />
                )}
            </main>

            {/* Related Products Section */}
            <RelatedProducts postId={postId} />

            <Footer />
        </div>
    );
}
