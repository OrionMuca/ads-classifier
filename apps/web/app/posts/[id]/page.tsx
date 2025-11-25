'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { ImageGallery } from '@/components/ImageGallery';
import { useAuth } from '@/contexts/AuthContext';

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const postId = params.id as string;

    const { data: post, isLoading } = useQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
            const { data } = await api.get(`/posts/${postId}`);
            return data;
        },
    });

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </>
        );
    }

    if (!post) {
        return (
            <>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                    <h1 className="text-2xl font-bold">Post not found</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-slate-900 min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <ImageGallery images={post.images || []} title={post.title} />
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="text-3xl font-bold flex-1 text-slate-900 dark:text-white">{post.title}</h1>
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

                        <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                            €{Number(post.price).toLocaleString()}
                        </p>

                        <div className="flex gap-4 mb-6">
                            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white">
                                {post.category?.icon} {post.category?.name}
                            </span>
                            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white">
                                📍 {post.location?.city}
                            </span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Description</h2>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
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

                        <button className="w-full btn-primary py-4 text-lg text-white">
                            Contact Seller
                        </button>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                            Posted on {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
