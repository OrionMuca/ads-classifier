'use client';

import { useState } from 'react';
import { Category } from '@/types';
import { CategoryIcon } from '@/lib/category-icons';

interface CategorySelectorProps {
    categories: Category[];
    value: string;
    onChange: (categoryId: string) => void;
    isLoading?: boolean;
}

export function CategorySelector({ categories, value, onChange, isLoading }: CategorySelectorProps) {
    const [selectedParentId, setSelectedParentId] = useState<string>('');

    // Find selected category and its parent
    const selectedCategory = categories
        .flatMap(cat => [cat, ...(cat.children || [])])
        .find(cat => cat.id === value);

    const parentCategory = selectedCategory?.parentId
        ? categories.find(cat => cat.id === selectedCategory.parentId)
        : categories.find(cat => cat.id === value && (!cat.children || cat.children.length === 0));

    const currentParentId = parentCategory?.id || selectedParentId;

    // Get subcategories for selected parent
    const parentCategoryData = categories.find(cat => cat.id === currentParentId);
    const subcategories = parentCategoryData?.children || [];

    const handleParentChange = (parentId: string) => {
        setSelectedParentId(parentId);
        const parent = categories.find(c => c.id === parentId);
        
        // If parent has no children, select it directly
        if (parent && (!parent.children || parent.children.length === 0)) {
            onChange(parentId);
        } else {
            // Reset to parent selection if it has children
            onChange('');
        }
    };

    if (isLoading) {
        return (
            <div className="text-sm text-gray-500">Duke ngarkuar...</div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Parent Category Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategoria Kryesore *
                </label>
                <select
                    required
                    value={currentParentId}
                    onChange={(e) => handleParentChange(e.target.value)}
                    className="input"
                >
                    <option value="">Zgjidhni kategorinë kryesore</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                            {cat.children && cat.children.length > 0 && ` (${cat.children.length} nënkategori)`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Subcategory Selection (only if parent has children) */}
            {subcategories.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nënkategoria *
                    </label>
                    <select
                        required
                        value={value || ''}
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            onChange(selectedValue);
                        }}
                        className={`input ${!value && subcategories.length > 0 ? 'border-red-300 dark:border-red-700' : ''}`}
                    >
                        <option value="">Zgjidhni nënkategorinë</option>
                        {subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                    {!value && subcategories.length > 0 && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            Ju lutem zgjidhni një nënkategori
                        </p>
                    )}
                    {parentCategoryData && value && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            Nënkategori e: <CategoryIcon categoryName={parentCategoryData.name} className="w-3 h-3" /> {parentCategoryData.name}
                        </p>
                    )}
                </div>
            )}

            {/* Show selected category info */}
            {value && selectedCategory && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                        Kategoria e zgjedhur:
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <CategoryIcon categoryName={selectedCategory.name} className="w-4 h-4" />
                        {selectedCategory.name}
                    </p>
                </div>
            )}
        </div>
    );
}

