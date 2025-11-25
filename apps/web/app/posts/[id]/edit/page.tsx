'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCategories, useLocations } from '@/lib/api-hooks';
import { Navbar } from '@/components/Navbar';
import { ImageUpload } from '@/components/ImageUpload';
import { CategorySelector } from '@/components/CategorySelector';
import { LocationSelector } from '@/components/LocationSelector';
import { useAuth } from '@/contexts/AuthContext';

export default function EditPost() {
    const router = useRouter();
    const params = useParams();
    const { isAuthenticated } = useAuth();
    const postId = params.id as string;

    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: locations = [], isLoading: locationsLoading } = useLocations();

    // Fetch post data
    const { data: post, isLoading: postLoading, error: postError } = useQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
            const response = await api.get(`/posts/${postId}`);
            return response.data;
        },
        enabled: !!postId,
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        locationId: '',
        zoneId: '',
        images: [] as string[],
    });

    // Populate form when post data loads
    useEffect(() => {
        if (post) {
            // Check if user owns the post
            if (!isAuthenticated) {
                router.push(`/posts/${postId}`);
                return;
            }

            setFormData({
                title: post.title || '',
                description: post.description || '',
                price: post.price?.toString() || '',
                categoryId: post.categoryId || '',
                locationId: post.locationId || '',
                zoneId: post.zoneId || '',
                images: post.images || [],
            });
        }
    }, [post, isAuthenticated, postId, router]);

    // Memoize callbacks to prevent infinite loops
    const handleLocationChange = useCallback((locationId: string) => {
        setFormData(prev => ({ ...prev, locationId, zoneId: '' }));
    }, []);

    const handleZoneChange = useCallback((zoneId: string) => {
        setFormData(prev => ({ ...prev, zoneId }));
    }, []);

    const updatePostMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.patch(`/posts/${postId}`, data);
            return response.data;
        },
        onSuccess: () => {
            router.push(`/posts/${postId}`);
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
        if (!categoryId || categoryId === '' || !uuidRegex.test(categoryId)) {
            alert('Ju lutem zgjidhni një kategori');
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

        // Check if selected location has zones
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

        updatePostMutation.mutate(submitData);
    };

    if (postLoading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="card">
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="mt-4 text-slate-600 dark:text-slate-400">Duke ngarkuar...</p>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (postError || !post) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="card">
                            <div className="text-center py-12">
                                <p className="text-red-600 dark:text-red-400">Gabim: Shpallja nuk u gjet</p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="mt-4 btn-primary"
                                >
                                    Kthehu në faqen kryesore
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar hideSearch={true} />

            <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Ndrysho Shpalljen
                            </h1>
                            <button
                                onClick={() => router.push(`/posts/${postId}`)}
                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                            >
                                Anulo
                            </button>
                        </div>

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
                                    onClick={() => router.push(`/posts/${postId}`)}
                                    className="btn-secondary flex-1"
                                    disabled={updatePostMutation.isPending}
                                >
                                    Anulo
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatePostMutation.isPending || formData.images.length === 0}
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updatePostMutation.isPending ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
                                </button>
                            </div>

                            {updatePostMutation.isError && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400 text-sm">
                                        {(updatePostMutation.error as any)?.response?.data?.message || 'Gabim: Ju lutem provoni përsëri'}
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}

