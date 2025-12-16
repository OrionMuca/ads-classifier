'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import { 
    ChatBubbleLeftRightIcon, 
    MagnifyingGlassIcon,
    EnvelopeIcon 
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch conversations
    const { data: conversations, isLoading: conversationsLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data } = await api.get('/messages/conversations');
            return data;
        },
        enabled: isAuthenticated,
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    });

    // Listen for real-time message notifications
    useEffect(() => {
        if (!socket) return;

        const handleMessageNotification = (data: any) => {
            // Invalidate conversations query to refetch and show updated unread counts
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        };

        const handleNewMessage = (message: any) => {
            // Invalidate conversations query to update last message preview
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        };

        socket.on('message_notification', handleMessageNotification);
        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('message_notification', handleMessageNotification);
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, queryClient]);

    useEffect(() => {
        // Don't redirect while auth is still loading
        if (authLoading) return;
        
        // Only redirect if auth has finished loading and user is not authenticated
        if (!isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, authLoading, router]);

    if (authLoading || !isAuthenticated) {
        return (
            <>
                <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900" />}>
                    <Navbar />
                </Suspense>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900" />}>
                <Navbar />
            </Suspense>
            
            <main className="bg-slate-50 dark:bg-slate-950 py-4 sm:py-8 pb-20 lg:pb-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Mesazhet
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Bisedo me blerësit dhe shitësit
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Kërko mesazhe..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    {conversationsLoading ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                            <div className="animate-pulse">Duke ngarkuar...</div>
                        </div>
                    ) : conversations && conversations.length > 0 ? (
                        <div className="space-y-2">
                            {conversations
                                .filter((conv: any) => {
                                    if (!searchQuery) return true;
                                    const query = searchQuery.toLowerCase();
                                    const otherUser = conv.participants?.find((p: any) => p.userId !== user?.id)?.user;
                                    const postTitle = conv.post?.title?.toLowerCase() || '';
                                    return (
                                        otherUser?.name?.toLowerCase().includes(query) ||
                                        otherUser?.email?.toLowerCase().includes(query) ||
                                        conv.lastMessage?.content?.toLowerCase().includes(query) ||
                                        postTitle.includes(query)
                                    );
                                })
                                .map((conversation: any) => {
                                    const otherUser = conversation.participants?.find((p: any) => p.userId !== user?.id)?.user;
                                    const lastMessage = conversation.lastMessage;
                                    const unreadCount = conversation.unreadCount || 0;
                                    
                                    return (
                                        <Link
                                            key={conversation.id}
                                            href={`/messages/${conversation.id}`}
                                            className="block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Avatar */}
                                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                                                    {otherUser?.avatar ? (
                                                        <img
                                                            src={otherUser.avatar}
                                                            alt={otherUser.name || 'User'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                                                            {(otherUser?.name || otherUser?.email || 'U')[0].toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                                            {otherUser?.name || otherUser?.email || 'Përdorues i panjohur'}
                                                        </h3>
                                                        {lastMessage && (
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                                {new Date(lastMessage.createdAt).toLocaleDateString('sq-AL', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {conversation.post && (
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {conversation.post.images && conversation.post.images.length > 0 && (
                                                                <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-slate-200 dark:bg-slate-700">
                                                                    <img
                                                                        src={conversation.post.images[0]}
                                                                        alt={conversation.post.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">
                                                                {conversation.post.title}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {lastMessage ? (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                            {lastMessage.content}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                                                            Nuk ka mesazhe ende
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Unread badge */}
                                                {unreadCount > 0 && (
                                                    <div className="flex-shrink-0">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-semibold">
                                                            {unreadCount > 9 ? '9+' : unreadCount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                Ende Nuk Ke Mesazhe
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                Kur ti kontakton shitësit ose blerësit të shkruajnë ty, bisedat do të shfaqen këtu.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => router.push('/')}
                                    className="btn-primary inline-flex items-center justify-center gap-2"
                                >
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                    Shfleto Produktet
                                </button>
                                <button
                                    onClick={() => router.push('/posts/new')}
                                    className="btn-secondary inline-flex items-center justify-center gap-2"
                                >
                                    <EnvelopeIcon className="w-5 h-5" />
                                    Krijo Postim
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
