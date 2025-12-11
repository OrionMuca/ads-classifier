'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCategories, useLocations } from '@/lib/api-hooks';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageUpload } from '@/components/ImageUpload';
import { CategorySelector } from '@/components/CategorySelector';
import { LocationSelector } from '@/components/LocationSelector';

const DRAFT_STORAGE_KEY = 'new-post-draft';

export default function NewPost() {
    const router = useRouter();
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: locations = [], isLoading: locationsLoading } = useLocations();

    // Load draft from localStorage on mount
    const [formData, setFormData] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    // Invalid saved data, use defaults
                }
            }
        }
        return {
            title: '',
            description: '',
            price: '',
            categoryId: '',
            locationId: '',
            zoneId: '',
            images: [] as string[],
        };
    });

    // Auto-save form data to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Only save if there's actual content (not just empty form)
            const hasContent = formData.title.trim() || 
                              formData.description.trim() || 
                              formData.price.trim() || 
                              formData.categoryId || 
                              formData.locationId || 
                              formData.images.length > 0;
            
            if (hasContent) {
                // Debounce the save to avoid too many writes
                const timeoutId = setTimeout(() => {
                    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
                }, 500); // Save 500ms after user stops typing
                
                return () => clearTimeout(timeoutId);
            } else {
                // Clear draft if form is empty
                localStorage.removeItem(DRAFT_STORAGE_KEY);
            }
        }
    }, [formData]);

    // Check if there's a restored draft on mount
    const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const hasContent = parsed.title?.trim() || 
                                    parsed.description?.trim() || 
                                    parsed.price?.trim() || 
                                    parsed.categoryId || 
                                    parsed.locationId || 
                                    parsed.images?.length > 0;
                    if (hasContent) {
                        setHasRestoredDraft(true);
                        // Hide notification after 5 seconds
                        setTimeout(() => setHasRestoredDraft(false), 5000);
                    }
                } catch (e) {
                    // Invalid saved data
                }
            }
        }
    }, []);

    const createPostMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/posts', data);
            return response.data;
        },
        onSuccess: (data) => {
            // Clear draft when post is successfully created
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            router.push(`/posts/${data.id}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.images.length === 0) {
            alert('Ju lutem shtoni të paktën një imazh');
            return;
        }

        // UUID validation regex
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // Validate categoryId - must be a valid UUID
        const categoryId = formData.categoryId?.trim();
        if (!categoryId || categoryId === '') {
            alert('Ju lutem zgjidhni një kategori');
            return;
        }
        if (!uuidRegex.test(categoryId)) {
            alert('Gabim: ID e kategorisë nuk është e vlefshme. Ju lutem zgjidhni kategorinë përsëri.');
            return;
        }

        // Validate locationId - check if it exists in locations array
        const locationId = formData.locationId?.trim();
        if (!locationId || locationId === '') {
            alert('Ju lutem zgjidhni një qytet');
            return;
        }
        
        // Check if locationId exists in locations array
        const selectedLocation = locations.find(loc => loc.id === locationId);
        if (!selectedLocation) {
            alert('Gabim: Qyteti i zgjedhur nuk ekziston. Ju lutem zgjidhni qytetin përsëri.');
            return;
        }

        // Check if selected location has zones (selectedLocation already found above)
        if (selectedLocation?.hasZones) {
            // If location has zones, zoneId is required
            const zoneId = formData.zoneId?.trim();
            if (!zoneId || zoneId === '' || !uuidRegex.test(zoneId)) {
                alert('Ju lutem zgjidhni një zonë për këtë qytet');
                return;
            }
        }

        // Ensure we only send valid data (no empty strings)
        const submitData: any = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price),
            categoryId: categoryId,
            locationId: locationId,
            images: formData.images.filter(img => img && img.trim() !== ''),
        };

        // Only include zoneId if location has zones
        if (selectedLocation?.hasZones && formData.zoneId) {
            submitData.zoneId = formData.zoneId.trim();
        }

        createPostMutation.mutate(submitData);
    };

    // Memoize callbacks to prevent infinite loops
    const handleLocationChange = useCallback((locationId: string) => {
        setFormData(prev => ({ ...prev, locationId, zoneId: '' }));
    }, []);

    const handleZoneChange = useCallback((zoneId: string) => {
        setFormData(prev => ({ ...prev, zoneId }));
    }, []);

    return (
        <>
            <Navbar hideSearch={true} />

            <main className="bg-slate-50 dark:bg-slate-950 py-8 pb-20 lg:pb-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="card">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                            Shto Shpallje të Re
                        </h1>

                        {hasRestoredDraft && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    ✓ Draft u rikthye automatikisht. Të dhënat tuaja janë ruajtur.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Titulli *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input"
                                    placeholder="P.sh., iPhone 13 Pro Max"
                                    maxLength={200}
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    {formData.title.length}/200 karaktere
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Përshkrimi *
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input"
                                    placeholder="Përshkruani produktin tuaj në detaje..."
                                    maxLength={2000}
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    {formData.description.length}/2000 karaktere
                                </p>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Çmimi (€) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">€</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input pl-8"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <CategorySelector
                                    categories={categories}
                                    value={formData.categoryId}
                                    onChange={(categoryId) => setFormData({ ...formData, categoryId })}
                                    isLoading={categoriesLoading}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <LocationSelector
                                    locations={locations}
                                    value={formData.locationId}
                                    zoneValue={formData.zoneId}
                                    onChange={handleLocationChange}
                                    onZoneChange={handleZoneChange}
                                    isLoading={locationsLoading}
                                />
                            </div>

                            {/* Images */}
                            <div>
                                <ImageUpload
                                    images={formData.images}
                                    onChange={(images) => setFormData({ ...formData, images })}
                                    maxImages={10}
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Clear draft when canceling
                                        localStorage.removeItem(DRAFT_STORAGE_KEY);
                                        router.back();
                                    }}
                                    className="btn-secondary flex-1"
                                    disabled={createPostMutation.isPending}
                                >
                                    Anulo
                                </button>
                                <button
                                    type="submit"
                                    disabled={createPostMutation.isPending || formData.images.length === 0}
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {createPostMutation.isPending ? 'Duke publikuar...' : 'Publiko Shpalljen'}
                                </button>
                            </div>

                            {createPostMutation.isError && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400 text-sm">
                                        {(createPostMutation.error as any)?.response?.data?.message || 'Gabim: Ju lutem provoni përsëri'}
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
