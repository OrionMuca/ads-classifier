'use client';

import { useState, useRef, useCallback } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
    const { isAuthenticated } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        if (!isAuthenticated) {
            alert('Ju duhet të jeni të kyçur për të ngarkuar imazhe');
            return;
        }

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        setUploading(true);

        try {
            const formData = new FormData();
            filesToUpload.forEach((file) => {
                formData.append('images', file);
            });

            // Don't set Content-Type header - browser will set it automatically with boundary
            const response = await api.post('/upload/images', formData);

            onChange([...images, ...response.data.urls]);
        } catch (error: any) {
            console.error('Upload error:', error);
            if (error.response?.status === 401) {
                alert('Ju duhet të jeni të kyçur për të ngarkuar imazhe. Ju lutem rifreskoni faqen dhe provoni përsëri.');
            } else {
                alert(error.response?.data?.message || 'Failed to upload images');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    }, [images, maxImages]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    const canAddMore = images.length < maxImages;

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Imazhet {images.length > 0 && `(${images.length}/${maxImages})`}
            </label>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-800">
                                <img
                                    src={url}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                    Cover
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            {canAddMore && (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-300 dark:border-slate-600 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                    />

                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                            >
                                Click to upload
                            </button>
                            {' or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            PNG, JPG, GIF up to 5MB each (max {maxImages} images)
                        </p>
                    </div>

                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!canAddMore && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Maximum {maxImages} images reached
                </p>
            )}
        </div>
    );
}

