'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
    HomeIcon, 
    MagnifyingGlassIcon, 
    PlusCircleIcon, 
    ChatBubbleLeftRightIcon, 
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    MagnifyingGlassIcon as MagnifyingGlassIconSolid,
    ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
    UserCircleIcon as UserCircleIconSolid
} from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { SearchModal } from '@/components/SearchModal';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Hide footer nav on admin pages
    const isAdminPage = pathname?.startsWith('/admin');

    // Determine active state
    const isHome = pathname === '/';
    const isProfile = pathname === '/profile';
    const isNewPost = pathname === '/posts/new';
    const isMessages = pathname === '/messages';

    // Handle search click - scroll to top and focus navbar search
    const handleSearchClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsSearchModalOpen(true);
    };

    // Handle protected routes
    const handleProtectedRoute = (e: React.MouseEvent, route: string) => {
        if (!isAuthenticated) {
            e.preventDefault();
            router.push('/auth/login');
        }
    };

    return (
        <>
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 pb-20 lg:pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Marketplace
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Platforma juaj e besuar për blerje dhe shitje produktesh cilësore. Gjej ofertat më të mira dhe lidhu me shitësit në zonën tënde.
                        </p>
                        <div className="flex gap-3">
                            <a 
                                href="#" 
                                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                aria-label="Facebook"
                            >
                                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a 
                                href="#" 
                                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                aria-label="Instagram"
                            >
                                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a 
                                href="#" 
                                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                aria-label="Twitter"
                            >
                                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                        </div>
                    </div>


                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Na Kontaktoni
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <EnvelopeIcon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                <a href="mailto:support@marketplace.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    support@marketplace.com
                                </a>
                            </li>
                            <li className="flex items-start gap-2">
                                <PhoneIcon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                <a href="tel:+355692123456" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    +355 69 212 3456
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            © {currentYear} Marketplace. Të gjitha të drejtat e rezervuara.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                Politika e Privatësisë
                            </Link>
                            <Link href="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                Kushtet e Shërbimit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar - Fixed at bottom on mobile (hide on admin pages) */}
            {!isAdminPage && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 safe-area-bottom shadow-lg">
                <div className="flex justify-around items-center h-16 px-2">
                    {/* Home */}
                    <Link 
                        href="/" 
                        className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                            isHome 
                                ? 'text-primary-600 dark:text-primary-400' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                    >
                        {isHome ? <HomeIconSolid className="w-6 h-6" /> : <HomeIcon className="w-6 h-6" />}
                        <span className={`text-xs mt-1 ${isHome ? 'font-semibold' : ''}`}>Kryefaqja</span>
                    </Link>

                    {/* Search */}
                    <button
                        onClick={handleSearchClick}
                        className="flex flex-col items-center justify-center flex-1 py-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <MagnifyingGlassIcon className="w-6 h-6" />
                        <span className="text-xs mt-1">Kërko</span>
                    </button>

                    {/* Sell */}
                    <Link 
                        href="/posts/new"
                        onClick={(e) => handleProtectedRoute(e, '/posts/new')}
                        className="flex flex-col items-center justify-center flex-1 py-2 text-primary-600 dark:text-primary-400"
                    >
                        <div className={`w-12 h-12 -mt-6 rounded-full flex items-center justify-center shadow-lg transition-all ${
                            isNewPost 
                                ? 'bg-primary-700 dark:bg-primary-600 scale-110' 
                                : 'bg-primary-600 dark:bg-primary-500 hover:scale-105'
                        }`}>
                            <PlusCircleIcon className="w-7 h-7 text-white" />
                        </div>
                        <span className={`text-xs mt-1 ${isNewPost ? 'font-semibold' : ''}`}>Shto</span>
                    </Link>

                    {/* Messages */}
                    <Link 
                        href="/messages"
                        onClick={(e) => handleProtectedRoute(e, '/messages')}
                        className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                            isMessages 
                                ? 'text-primary-600 dark:text-primary-400' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                    >
                        {isMessages ? <ChatBubbleLeftRightIconSolid className="w-6 h-6" /> : <ChatBubbleLeftRightIcon className="w-6 h-6" />}
                        <span className={`text-xs mt-1 ${isMessages ? 'font-semibold' : ''}`}>Mesazhe</span>
                    </Link>

                    {/* Profile */}
                    <Link 
                        href="/profile"
                        onClick={(e) => handleProtectedRoute(e, '/profile')}
                        className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                            isProfile 
                                ? 'text-primary-600 dark:text-primary-400' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                    >
                        {isProfile ? <UserCircleIconSolid className="w-6 h-6" /> : <UserCircleIcon className="w-6 h-6" />}
                        <span className={`text-xs mt-1 ${isProfile ? 'font-semibold' : ''}`}>Profili</span>
                    </Link>
                </div>
            </div>
            )}
        </footer>
        <SearchModal 
            isOpen={isSearchModalOpen} 
            onClose={() => setIsSearchModalOpen(false)} 
        />
        </>
    );
}
