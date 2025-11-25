'use client';

import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                aria-label="Grid view"
                title="Grid view"
            >
                <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                aria-label="List view"
                title="List view"
            >
                <ListBulletIcon className="w-5 h-5" />
            </button>
        </div>
    );
}

