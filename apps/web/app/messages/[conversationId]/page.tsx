'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSocket } from '@/contexts/SocketContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
    const { socket, isConnected } = useSocket();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversation
    const { data: conversation } = useQuery({
        queryKey: ['conversation', params.conversationId],
        queryFn: async () => {
            const response = await api.get(`/messages/conversations/${params.conversationId}`);
            return response.data;
        },
    });

    // Initialize messages
    useEffect(() => {
        if (conversation?.messages) {
            setMessages(conversation.messages);
        }
    }, [conversation]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        // Join conversation
        socket.emit('join_conversation', { conversationId: params.conversationId });

        // Listen for new messages
        socket.on('new_message', (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
        });

        return () => {
            socket.off('new_message');
            socket.emit('leave_conversation', { conversationId: params.conversationId });
        };
    }, [socket, params.conversationId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message
    const sendMessage = () => {
        if (!message.trim() || !socket) return;

        socket.emit('send_message', {
            conversationId: params.conversationId,
            content: message.trim(),
        }, (response: any) => {
            if (response.success) {
                setMessage('');
            } else {
                alert(response.error || 'Gabim në dërgimin e mesazhit');
            }
        });
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 lg:pb-8">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Biseda
                        </h2>
                    </div>

                    {/* Messages */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 mb-4 h-[500px] overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                                Nuk ka mesazhe ende. Filloni bisedën!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderId === conversation?.participants[0]?.userId ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                msg.senderId === conversation?.participants[0]?.userId
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                            }`}
                                        >
                                            <p>{msg.content}</p>
                                            <span className="text-xs opacity-70 mt-1 block">
                                                {new Date(msg.createdAt).toLocaleTimeString('sq-AL', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
            </main>
            <Footer />
        </>
    );
}
