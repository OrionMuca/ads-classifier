'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    ChartBarIcon,
    UserGroupIcon,
    DocumentTextIcon,
    TagIcon,
    MapPinIcon,
    PhotoIcon,
    Squares2X2Icon,
    ShieldExclamationIcon,
    CreditCardIcon,
    PaintBrushIcon,
    HomeIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';

interface AdminMobileMenuProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

// Group menu items by category for better organization
const menuGroups = [
    {
        title: 'Overview',
        items: [
            { icon: ChartBarIcon, label: 'Paneli', view: 'dashboard' },
        ]
    },
    {
        title: 'Content',
        items: [
            { icon: DocumentTextIcon, label: 'Postimet', view: 'posts' },
            { icon: TagIcon, label: 'Kategoritë', view: 'categories' },
            { icon: PhotoIcon, label: 'Reklamat', view: 'ads' },
        ]
    },
    {
        title: 'Location',
        items: [
            { icon: MapPinIcon, label: 'Vendndodhjet', view: 'locations' },
            { icon: Squares2X2Icon, label: 'Zonat', view: 'zones' },
        ]
    },
    {
        title: 'Users & Settings',
        items: [
            { icon: UserGroupIcon, label: 'Përdoruesit', view: 'users' },
            { icon: ShieldExclamationIcon, label: 'Blacklist', view: 'blacklist' },
            { icon: CreditCardIcon, label: 'Abonimet', view: 'subscriptions' },
            { icon: PaintBrushIcon, label: 'Tema', view: 'theme' },
        ]
    },
];

// Quick access items for bottom nav (most frequently used)
const quickAccessItems = [
    { icon: ChartBarIcon, label: 'Paneli', view: 'dashboard' },
    { icon: UserGroupIcon, label: 'Përdoruesit', view: 'users' },
    { icon: DocumentTextIcon, label: 'Postimet', view: 'posts' },
    { icon: TagIcon, label: 'Kategoritë', view: 'categories' },
];

export function AdminMobileMenu({ activeView, onViewChange }: AdminMobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const sheetRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleViewChange = (view: string) => {
        onViewChange(view);
        setIsOpen(false);
    };

    // Swipe down to close
    const handleTouchStart = (e: React.TouchEvent) => {
        if (sheetRef.current) {
            const touch = e.touches[0];
            setStartY(touch.clientY);
            isDragging.current = true;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging.current && sheetRef.current) {
            const touch = e.touches[0];
            const deltaY = touch.clientY - startY;
            if (deltaY > 0) {
                setCurrentY(deltaY);
                sheetRef.current.style.transform = `translateY(${deltaY}px)`;
            }
        }
    };

    const handleTouchEnd = () => {
        if (isDragging.current && sheetRef.current) {
            if (currentY > 100) {
                setIsOpen(false);
            }
            sheetRef.current.style.transform = '';
            setCurrentY(0);
            isDragging.current = false;
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Bottom Navigation Bar - Quick Access */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
                <div className="flex items-center justify-around px-2 py-2">
                    {quickAccessItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.view;
                        return (
                            <button
                                key={item.view}
                                onClick={() => handleViewChange(item.view)}
                                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
                                    isActive
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setIsOpen(true)}
                        className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
                            isOpen
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${isOpen ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                            <Bars3Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium">Më shumë</span>
                    </button>
                </div>
            </nav>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Bottom Sheet */}
            {isOpen && (
                <div
                    ref={sheetRef}
                    className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
                        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Menyja Admin
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 -mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
                            aria-label="Close menu"
                        >
                            <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu Items - Grouped */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {menuGroups.map((group, groupIndex) => (
                            <div key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
                                    {group.title}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeView === item.view;
                                        
                                        return (
                                            <button
                                                key={item.view}
                                                onClick={() => handleViewChange(item.view)}
                                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] ${
                                                    isActive
                                                        ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-md'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                                <span className="font-medium text-base">{item.label}</span>
                                                {isActive && (
                                                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Back to Marketplace Button */}
                    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-medium active:scale-[0.98]"
                        >
                            <HomeIcon className="w-5 h-5" />
                            <span>Kthehu në Marketplace</span>
                        </Link>
                    </div>

                    {/* Safe Area Bottom Padding */}
                    <div className="h-safe-area-inset-bottom bg-slate-50 dark:bg-slate-800/50" />
                </div>
            )}
        </>
    );
}
