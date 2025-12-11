'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    XMarkIcon,
    ChartBarIcon,
    UserGroupIcon,
    DocumentTextIcon,
    TagIcon,
    MapPinIcon,
    PhotoIcon,
    Squares2X2Icon,
    Bars3BottomLeftIcon,
    ShieldExclamationIcon,
    CreditCardIcon,
    PaintBrushIcon
} from '@heroicons/react/24/outline';

interface AdminMobileMenuProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export function AdminMobileMenu({ activeView, onViewChange }: AdminMobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { icon: ChartBarIcon, label: 'Paneli', view: 'dashboard' },
        { icon: UserGroupIcon, label: 'Përdoruesit', view: 'users' },
        { icon: DocumentTextIcon, label: 'Postimet', view: 'posts' },
        { icon: TagIcon, label: 'Kategoritë', view: 'categories' },
        { icon: MapPinIcon, label: 'Vendndodhjet', view: 'locations' },
        { icon: Squares2X2Icon, label: 'Zonat', view: 'zones' },
        { icon: PhotoIcon, label: 'Reklamat', view: 'ads' },
        { icon: ShieldExclamationIcon, label: 'Blacklist', view: 'blacklist' },
        { icon: CreditCardIcon, label: 'Abonimet', view: 'subscriptions' },
        { icon: PaintBrushIcon, label: 'Tema', view: 'theme' },
    ];

    const handleViewChange = (view: string) => {
        onViewChange(view);
        setIsOpen(false);
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                aria-label="Open admin menu"
            >
                <Bars3BottomLeftIcon className="w-6 h-6" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Bottom Sheet */}
            {isOpen && (
                <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Menyja Admin
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-3">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeView === item.view;
                                
                                return (
                                    <button
                                        key={item.view}
                                        onClick={() => handleViewChange(item.view)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                                            isActive
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <Icon className="w-7 h-7 mb-2" />
                                        <span className="text-sm font-medium text-center">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Safe Area Bottom Padding */}
                    <div className="h-safe-area-inset-bottom" />
                </div>
            )}
        </>
    );
}
