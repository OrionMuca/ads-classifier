'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useCategories, useLocations } from '@/lib/api-hooks';

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: {
        categoryId: string;
        locationId: string;
        minPrice: string;
        maxPrice: string;
    };
    sortBy: SortOption;
    onFiltersChange: (filters: any) => void;
    onSortChange: (sort: SortOption) => void;
}

const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: 'newest', label: 'Më të rejat' },
    { value: 'price-low', label: 'Çmimi: Nga më i ulët' },
    { value: 'price-high', label: 'Çmimi: Nga më i lartë' },
    { value: 'popular', label: 'Më të popullarit' },
];

export function FilterDrawer({ isOpen, onClose, filters, sortBy, onFiltersChange, onSortChange }: FilterDrawerProps) {
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: locations = [], isLoading: locationsLoading } = useLocations();

    const handleChange = (field: string, value: string) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            categoryId: '',
            locationId: '',
            minPrice: '',
            maxPrice: '',
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-40" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col bg-white dark:bg-slate-900 shadow-xl">
                                        <div className="flex items-center justify-between px-6 py-6 border-b dark:border-gray-800">
                                            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                                                Filtrat
                                            </Dialog.Title>
                                            <button
                                                type="button"
                                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                onClick={onClose}
                                            >
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                                            {/* Sort Options */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                    <FunnelIcon className="w-5 h-5" />
                                                    Rendit sipas
                                                </label>
                                                <div className="space-y-2">
                                                    {sortOptions.map((option) => (
                                                        <label
                                                            key={option.value}
                                                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="sortBy"
                                                                value={option.value}
                                                                checked={sortBy === option.value}
                                                                onChange={() => onSortChange(option.value)}
                                                                className="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-2"
                                                            />
                                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                                {option.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t dark:border-slate-700 pt-6">
                                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                                    Filtro
                                                </h3>
                                            </div>

                                            {/* Category Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Kategoria
                                                </label>
                                                {categoriesLoading ? (
                                                    <div className="text-sm text-gray-500">Duke ngarkuar...</div>
                                                ) : (
                                                    <select
                                                        value={filters.categoryId}
                                                        onChange={(e) => handleChange('categoryId', e.target.value)}
                                                        className="input"
                                                    >
                                                        <option value="">Të gjitha</option>
                                                        {categories.map((cat) => (
                                                            <option key={cat.id} value={cat.id}>
                                                                {cat.icon} {cat.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            {/* Location Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Qyteti
                                                </label>
                                                {locationsLoading ? (
                                                    <div className="text-sm text-gray-500">Duke ngarkuar...</div>
                                                ) : (
                                                    <select
                                                        value={filters.locationId}
                                                        onChange={(e) => handleChange('locationId', e.target.value)}
                                                        className="input"
                                                    >
                                                        <option value="">Të gjitha</option>
                                                        {locations.map((loc) => (
                                                            <option key={loc.id} value={loc.id}>
                                                                {loc.city}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            {/* Price Range */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Çmimi
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="number"
                                                        placeholder="Minimum"
                                                        value={filters.minPrice}
                                                        onChange={(e) => handleChange('minPrice', e.target.value)}
                                                        className="input"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Maximum"
                                                        value={filters.maxPrice}
                                                        onChange={(e) => handleChange('maxPrice', e.target.value)}
                                                        className="input"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t dark:border-gray-800 px-6 py-4 flex gap-3">
                                            <button onClick={clearFilters} className="btn-secondary flex-1">
                                                Pastro
                                            </button>
                                            <button onClick={onClose} className="btn-primary flex-1">
                                                Apliko
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
