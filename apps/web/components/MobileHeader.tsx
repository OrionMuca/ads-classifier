'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MobileHeaderProps {
    title: string;
    showBack?: boolean;
    showLogo?: boolean;
    rightAction?: React.ReactNode;
}

export function MobileHeader({ title, showBack = true, showLogo = false, rightAction }: MobileHeaderProps) {
    const router = useRouter();

    return (
        <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {showBack && (
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    )}
                    {showLogo ? (
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">M</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                Marketplace
                            </span>
                        </Link>
                    ) : (
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {title}
                        </h1>
                    )}
                </div>
                {rightAction && (
                    <div className="flex-shrink-0 ml-2">
                        {rightAction}
                    </div>
                )}
            </div>
        </div>
    );
}
