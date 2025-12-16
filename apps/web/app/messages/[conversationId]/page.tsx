'use client';

import { useState, useEffect, useRef, Suspense, use } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/components/admin/Toast';
import { PaperAirplaneIcon, ArrowLeftIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';

export const dynamic = 'force-dynamic';

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const resolvedParams = use(params);
    const conversationId = resolvedParams.conversationId;
    const router = useRouter();
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const hasScrolledManuallyRef = useRef(false);
    const isInitialLoadRef = useRef(true);
    const isTypingRef = useRef(false);

    // Fetch conversation
    const { data: conversation, isLoading: conversationLoading, error: conversationError } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: async () => {
            if (!conversationId) return null;
            const response = await api.get(`/messages/conversations/${conversationId}`);
            return response.data;
        },
        enabled: !!conversationId,
    });

    // Show error if conversation fetch fails
    useEffect(() => {
        if (conversationError) {
            showToast('Gabim në ngarkimin e bisedës. Ju lutemi provoni përsëri.', 'error');
        }
    }, [conversationError, showToast]);

    // Initialize messages - ensure we always have an array
    useEffect(() => {
        if (conversation) {
            // Check if messages exist and is an array
            if (Array.isArray(conversation.messages)) {
                setMessages(conversation.messages);
            } else {
                // If messages is undefined or not an array, set empty array
                setMessages([]);
            }
        }
    }, [conversation]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !conversationId) return;

        // Join conversation
        socket.emit('join_conversation', { conversationId });

        // Listen for new messages
        socket.on('new_message', (newMessage) => {
            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
            });
        });

        // Mark messages as read when viewing
        if (conversation && user) {
            socket.emit('mark_read', { conversationId });
        }

        return () => {
            socket.off('new_message');
            socket.emit('leave_conversation', { conversationId });
        };
    }, [socket, conversationId, conversation, user]);

    // Track manual scrolling
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            // Check if user scrolled up (not at bottom)
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
            if (!isAtBottom) {
                hasScrolledManuallyRef.current = true;
            } else if (isAtBottom && hasScrolledManuallyRef.current) {
                // User scrolled back to bottom, allow auto-scroll again
                hasScrolledManuallyRef.current = false;
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-scroll to bottom only when:
    // 1. Initial load (first time messages are loaded)
    // 2. New messages arrive AND user is at bottom (hasn't scrolled up) AND not typing
    const prevMessagesLengthRef = useRef(0);
    useEffect(() => {
        if (messages.length === 0) return;

        const shouldAutoScroll = 
            isInitialLoadRef.current || 
            (messages.length > prevMessagesLengthRef.current && !hasScrolledManuallyRef.current && !isTypingRef.current);

        if (shouldAutoScroll) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: isInitialLoadRef.current ? 'auto' : 'smooth' });
                isInitialLoadRef.current = false;
            }, 100);
        }

        prevMessagesLengthRef.current = messages.length;
    }, [messages.length]);

    // Send message
    const sendMessage = () => {
        if (!message.trim() || !socket || !conversationId) {
            if (!conversationId) {
                showToast('ID e bisedës nuk është e vlefshme', 'error');
            }
            return;
        }

        const messageContent = message.trim();
        setMessage('');
        isTypingRef.current = false;

        socket.emit('send_message', {
            conversationId,
            content: messageContent,
        }, (response: any) => {
            if (!response.success) {
                showToast(response.error || 'Gabim në dërgimin e mesazhit', 'error');
            }
        });
    };

    return (
        <>
            <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900" />}>
                <Navbar />
            </Suspense>
            {/* Chat container with fixed height using viewport */}
            <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
                <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0 px-4 py-4">
                    {/* Header - Fixed at top */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-4 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-3">
                            <button
                                onClick={() => router.push('/messages')}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
                            >
                                <ArrowLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <div className="flex-1 min-w-0">
                                {conversation?.participants && (() => {
                                    const otherUser = conversation.participants.find((p: any) => p.userId !== user?.id)?.user;
                                    return (
                                        <>
                                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                                                {otherUser?.name || otherUser?.email || 'Përdorues'}
                                            </h2>
                                            {conversation.post && (
                                                <Link
                                                    href={`/posts/${conversation.post.id}`}
                                                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                                >
                                                    <span className="truncate">{conversation.post.title}</span>
                                                    <span>→</span>
                                                </Link>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Post/Product Info Card */}
                        {conversation?.post && (
                            <Link
                                href={`/posts/${conversation.post.id}`}
                                className="block border-t border-slate-200 dark:border-slate-800 pt-3 mt-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-3 -mx-3 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {conversation.post.images && conversation.post.images.length > 0 && (
                                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                                            <img
                                                src={conversation.post.images[0]}
                                                alt={conversation.post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                                            {conversation.post.title}
                                        </h3>
                                        <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                                            {new Intl.NumberFormat('sq-AL', {
                                                style: 'currency',
                                                currency: 'ALL',
                                                minimumFractionDigits: 0,
                                            }).format(Number(conversation.post.price))}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* External contact links */}
                        {conversation?.participants && (() => {
                            const otherUser = conversation.participants.find((p: any) => p.userId !== user?.id)?.user;
                            const profile = otherUser?.profile;
                            const hasWhatsApp = profile?.whatsapp;
                            const hasInstagram = profile?.instagram;
                            const hasPhone = otherUser?.phone || profile?.whatsapp;

                            if (!hasWhatsApp && !hasInstagram && !hasPhone) return null;

                            const formatPhoneForWhatsApp = (phone: string) => {
                                const cleaned = phone.replace(/\D/g, '');
                                if (!cleaned.startsWith('355')) {
                                    return '355' + cleaned;
                                }
                                return cleaned;
                            };

                            return (
                                <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Kontakto:</span>
                                    {hasWhatsApp && (
                                        <a
                                            href={`https://wa.me/${formatPhoneForWhatsApp(profile.whatsapp)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                            title="WhatsApp"
                                        >
                                            <FaWhatsapp className="w-5 h-5" />
                                        </a>
                                    )}
                                    {hasPhone && (
                                        <a
                                            href={`tel:${hasPhone}`}
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Telefon"
                                        >
                                            <PhoneIcon className="w-5 h-5" />
                                        </a>
                                    )}
                                    {hasInstagram && (
                                        <a
                                            href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
                                            title="Instagram"
                                        >
                                            <FaInstagram className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Messages - Scrollable area that takes remaining space */}
                    <div 
                        ref={messagesContainerRef}
                        className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-4 flex-1 min-h-0 overflow-y-auto"
                    >
                        {conversationLoading ? (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                                <div className="animate-pulse">Duke ngarkuar mesazhet...</div>
                            </div>
                        ) : conversationError ? (
                            <div className="text-center text-red-500 dark:text-red-400 py-12">
                                Gabim në ngarkimin e mesazheve
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                                Nuk ka mesazhe ende. Filloni bisedën!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((msg) => {
                                    // More robust check for message ownership
                                    const isMyMessage = String(msg.senderId) === String(user?.id);
                                    const sender = msg.sender || conversation?.participants?.find((p: any) => p.userId === msg.senderId)?.user;
                                    const senderName = sender?.name || sender?.email || 'Përdorues';
                                    const senderAvatar = sender?.avatar;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex items-end gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* Avatar - only show for other user's messages */}
                                            {!isMyMessage && (
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                    {senderAvatar ? (
                                                        <img 
                                                            src={senderAvatar} 
                                                            alt={senderName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            {senderName.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Message bubble */}
                                            <div className={`flex flex-col max-w-[75%] ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                {/* Sender name and avatar - show for other user's messages or if multiple senders */}
                                                {!isMyMessage && (
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        {senderAvatar ? (
                                                            <img 
                                                                src={senderAvatar} 
                                                                alt={senderName}
                                                                className="w-4 h-4 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                                                                <span className="text-[8px] font-medium text-slate-600 dark:text-slate-300">
                                                                    {senderName.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            {senderName}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <div
                                                    className={`rounded-2xl px-4 py-2.5 ${
                                                        isMyMessage
                                                            ? 'bg-primary-600 dark:bg-primary-500 text-white rounded-br-sm'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm'
                                                    }`}
                                                >
                                                    <p className="break-words text-sm leading-relaxed">{msg.content}</p>
                                                    <span className={`text-xs mt-1.5 block ${isMyMessage ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString('sq-AL', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Spacer for alignment */}
                                            {isMyMessage && <div className="flex-shrink-0 w-8" />}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input - Fixed at bottom */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    isTypingRef.current = e.target.value.length > 0;
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                onBlur={() => {
                                    // Small delay to allow message send to complete
                                    setTimeout(() => {
                                        isTypingRef.current = false;
                                    }, 100);
                                }}
                                placeholder="Shkruaj një mesazh..."
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                disabled={!isConnected}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!message.trim() || !isConnected}
                                className="btn-primary flex items-center gap-2"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                                Dërgo
                            </button>
                        </div>
                        {!isConnected && (
                            <p className="text-sm text-red-500 mt-2">Duke u lidhur...</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
