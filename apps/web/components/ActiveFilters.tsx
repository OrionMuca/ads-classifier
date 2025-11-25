'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCategories, useLocations } from '@/lib/api-hooks';
import { SortOption } from '@/components/FilterDrawer';

interface ActiveFiltersProps {
    filters: {
        categoryId: string;
        locationId: string;
        minPrice: string;
        maxPrice: string;
    };
    sortBy?: SortOption;
    onFilterRemove: (filterType: 'categoryId' | 'locationId' | 'price' | 'sort') => void;
    onClearAll: () => void;
}

const sortLabels: Record<SortOption, string> = {
    'newest': 'Më të rejat',
    'price-low': 'Çmimi: Nga më i ulët',
    'price-high': 'Çmimi: Nga më i lartë',
    'popular': 'Më të popullarit',
};

export function ActiveFilters({ filters, sortBy, onFilterRemove, onClearAll }: ActiveFiltersProps) {
    const { data: categories = [] } = useCategories();
    const { data: locations = [] } = useLocations();

    const activeFilters: Array<{ type: string; label: string; value: string }> = [];

    // Sort filter (only show if not default)
    if (sortBy && sortBy !== 'newest') {
        activeFilters.push({
            type: 'sort',
            label: `📊 ${sortLabels[sortBy]}`,
            value: sortBy,
        });
    }

    // Category filter
    if (filters.categoryId) {
        const category = categories
            .flatMap((cat) => [cat, ...(cat.children || [])])
            .find((cat) => cat.id === filters.categoryId);
        if (category) {
            activeFilters.push({
                type: 'categoryId',
                label: category.icon ? `${category.icon} ${category.name}` : category.name,
                value: filters.categoryId,
            });
        }
    }

    // Location filter
    if (filters.locationId) {
        const location = locations.find((loc) => loc.id === filters.locationId);
        if (location) {
            activeFilters.push({
                type: 'locationId',
                label: `📍 ${location.city}`,
                value: filters.locationId,
            });
        }
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
        const priceLabel = filters.minPrice && filters.maxPrice
            ? `€${filters.minPrice} - €${filters.maxPrice}`
            : filters.minPrice
            ? `Min: €${filters.minPrice}`
            : `Max: €${filters.maxPrice}`;
        activeFilters.push({
            type: 'price',
            label: priceLabel,
            value: 'price',
        });
    }

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filtrat aktive:</span>
            {activeFilters.map((filter) => (
                <button
                    key={filter.type === 'price' ? 'price' : filter.value}
                    onClick={() => {
                        if (filter.type === 'price') {
                            onFilterRemove('price');
                        } else if (filter.type === 'sort') {
                            onFilterRemove('sort');
                        } else {
                            onFilterRemove(filter.type as 'categoryId' | 'locationId');
                        }
                    }}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                >
                    <span>{filter.label}</span>
                    <XMarkIcon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </button>
            ))}
            {activeFilters.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline"
                >
                    Pastro të gjitha
                </button>
            )}
        </div>
    );
}

