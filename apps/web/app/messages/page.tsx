'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { 
    ChatBubbleLeftRightIcon, 
    MagnifyingGlassIcon,
    EnvelopeIcon 
} from '@heroicons/react/24/outline';

export default function MessagesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

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
                <Navbar />
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            
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
                                placeholder="Kërko mesazhe..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Empty State */}
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

                    {/* Coming Soon Notice */}
                    <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-1">
                                    Sistemi i Mesazheve së Shpejti
                                </h4>
                                <p className="text-sm text-primary-700 dark:text-primary-300">
                                    Po ndërtojmë një sistem mesazhesh në kohë reale ku mund të bisedosh direkt me blerësit dhe shitësit. 
                                    Për momentin, mund t'i kontaktosh shitësit nëpërmjet informacionit të profilit të tyre.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
