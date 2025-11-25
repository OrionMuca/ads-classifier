'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Theme {
    id: string;
    name: string;
    isActive: boolean;
    primary50: string;
    primary100: string;
    primary200: string;
    primary300: string;
    primary400: string;
    primary500: string;
    primary600: string;
    primary700: string;
    primary800: string;
    primary900: string;
    secondary50: string;
    secondary100: string;
    secondary200: string;
    secondary300: string;
    secondary400: string;
    secondary500: string;
    secondary600: string;
    secondary700: string;
    secondary800: string;
    secondary900: string;
    accent50: string;
    accent100: string;
    accent200: string;
    accent300: string;
    accent400: string;
    accent500: string;
    accent600: string;
    accent700: string;
    accent800: string;
    accent900: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    logoUrl?: string;
    faviconUrl?: string;
}

interface ColorGroup {
    name: string;
    fields: string[];
}

const colorGroups: ColorGroup[] = [
    {
        name: 'Primary Colors',
        fields: ['primary50', 'primary100', 'primary200', 'primary300', 'primary400', 'primary500', 'primary600', 'primary700', 'primary800', 'primary900'],
    },
    {
        name: 'Secondary Colors',
        fields: ['secondary50', 'secondary100', 'secondary200', 'secondary300', 'secondary400', 'secondary500', 'secondary600', 'secondary700', 'secondary800', 'secondary900'],
    },
    {
        name: 'Accent Colors',
        fields: ['accent50', 'accent100', 'accent200', 'accent300', 'accent400', 'accent500', 'accent600', 'accent700', 'accent800', 'accent900'],
    },
];

const uiColors: ColorGroup = {
    name: 'UI Colors',
    fields: ['background', 'surface', 'textPrimary', 'textSecondary'],
};

export function ThemeEditor() {
    const queryClient = useQueryClient();
    const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Theme>>({});

    // Fetch all themes
    const { data: themes = [], isLoading } = useQuery({
        queryKey: ['themes'],
        queryFn: async () => {
            const { data } = await api.get('/theme');
            return data;
        },
    });

    // Fetch active theme
    const { data: activeTheme } = useQuery({
        queryKey: ['active-theme'],
        queryFn: async () => {
            const { data } = await api.get('/theme/active');
            return data;
        },
    });

    // Create theme mutation
    const createMutation = useMutation({
        mutationFn: async (themeData: Partial<Theme>) => {
            const { data } = await api.post('/theme', themeData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            queryClient.invalidateQueries({ queryKey: ['active-theme'] });
            setIsCreating(false);
            setFormData({});
        },
    });

    // Update theme mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Theme> }) => {
            const response = await api.patch(`/theme/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            queryClient.invalidateQueries({ queryKey: ['active-theme'] });
        },
    });

    // Activate theme mutation
    const activateMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post(`/theme/${id}/activate`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            queryClient.invalidateQueries({ queryKey: ['active-theme'] });
        },
    });

    // Delete theme mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/theme/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
            if (selectedTheme?.id === activeTheme?.id) {
                setSelectedTheme(null);
            }
        },
    });

    // Duplicate theme mutation
    const duplicateMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const { data } = await api.post(`/theme/${id}/duplicate`, { name });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['themes'] });
        },
    });

    // Load theme for editing
    useEffect(() => {
        if (selectedTheme) {
            setFormData(selectedTheme);
        }
    }, [selectedTheme]);

    const handleColorChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Remove read-only fields before sending
        const { id, createdAt, updatedAt, ...updateData } = formData;
        
        if (selectedTheme) {
            updateMutation.mutate({ id: selectedTheme.id, data: updateData });
        } else if (isCreating) {
            createMutation.mutate(updateData);
        }
    };

    const handleDuplicate = () => {
        if (selectedTheme) {
            const newName = `${selectedTheme.name}-copy-${Date.now()}`;
            duplicateMutation.mutate({ id: selectedTheme.id, name: newName });
        }
    };

    const handleNewTheme = () => {
        setIsCreating(true);
        setSelectedTheme(null);
        setFormData({
            name: '',
            isActive: false,
            ...(activeTheme ? {
                primary50: activeTheme.primary50,
                primary100: activeTheme.primary100,
                primary200: activeTheme.primary200,
                primary300: activeTheme.primary300,
                primary400: activeTheme.primary400,
                primary500: activeTheme.primary500,
                primary600: activeTheme.primary600,
                primary700: activeTheme.primary700,
                primary800: activeTheme.primary800,
                primary900: activeTheme.primary900,
                secondary50: activeTheme.secondary50,
                secondary100: activeTheme.secondary100,
                secondary200: activeTheme.secondary200,
                secondary300: activeTheme.secondary300,
                secondary400: activeTheme.secondary400,
                secondary500: activeTheme.secondary500,
                secondary600: activeTheme.secondary600,
                secondary700: activeTheme.secondary700,
                secondary800: activeTheme.secondary800,
                secondary900: activeTheme.secondary900,
                accent50: activeTheme.accent50,
                accent100: activeTheme.accent100,
                accent200: activeTheme.accent200,
                accent300: activeTheme.accent300,
                accent400: activeTheme.accent400,
                accent500: activeTheme.accent500,
                accent600: activeTheme.accent600,
                accent700: activeTheme.accent700,
                accent800: activeTheme.accent800,
                accent900: activeTheme.accent900,
                background: activeTheme.background,
                surface: activeTheme.surface,
                textPrimary: activeTheme.textPrimary,
                textSecondary: activeTheme.textSecondary,
            } : {}),
        });
    };

    if (isLoading) {
        return <div className="text-center py-12">Loading themes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Theme Editor</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Customize your marketplace appearance
                    </p>
                </div>
                <button
                    onClick={handleNewTheme}
                    className="btn-primary"
                >
                    + New Theme
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Theme List */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Themes</h3>
                        <div className="space-y-2">
                            {themes.map((theme: Theme) => (
                                <div
                                    key={theme.id}
                                    onClick={() => {
                                        setSelectedTheme(theme);
                                        setIsCreating(false);
                                    }}
                                    className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                                        selectedTheme?.id === theme.id
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : theme.isActive
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {theme.name}
                                            </div>
                                            {theme.isActive && (
                                                <span className="text-xs text-green-600 dark:text-green-400">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        {theme.isActive && (
                                            <span className="text-green-500">✓</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Theme Editor */}
                <div className="lg:col-span-2">
                    <div className="card">
                        {isCreating || selectedTheme ? (
                            <>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Theme Name</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
                                        placeholder="Enter theme name"
                                    />
                                </div>

                                {/* Color Groups */}
                                {colorGroups.map((group) => (
                                    <div key={group.name} className="mb-6">
                                        <h4 className="text-md font-semibold mb-3">{group.name}</h4>
                                        <div className="grid grid-cols-5 gap-3">
                                            {group.fields.map((field) => (
                                                <div key={field}>
                                                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={formData[field as keyof Theme] || '#000000'}
                                                            onChange={(e) => handleColorChange(field, e.target.value)}
                                                            className="w-12 h-10 rounded border cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={formData[field as keyof Theme] || ''}
                                                            onChange={(e) => handleColorChange(field, e.target.value)}
                                                            className="flex-1 px-2 py-1 text-xs border rounded dark:bg-slate-800"
                                                            placeholder="#000000"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* UI Colors */}
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold mb-3">{uiColors.name}</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {uiColors.fields.map((field) => (
                                            <div key={field}>
                                                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={formData[field as keyof Theme] || '#000000'}
                                                        onChange={(e) => handleColorChange(field, e.target.value)}
                                                        className="w-12 h-10 rounded border cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData[field as keyof Theme] || ''}
                                                        onChange={(e) => handleColorChange(field, e.target.value)}
                                                        className="flex-1 px-2 py-1 text-xs border rounded dark:bg-slate-800"
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Branding */}
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold mb-3">Branding</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Logo URL</label>
                                            <input
                                                type="url"
                                                value={formData.logoUrl || ''}
                                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
                                                placeholder="https://example.com/logo.png"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Favicon URL</label>
                                            <input
                                                type="url"
                                                value={formData.faviconUrl || ''}
                                                onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
                                                placeholder="https://example.com/favicon.ico"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="btn-primary"
                                    >
                                        {createMutation.isPending || updateMutation.isPending
                                            ? 'Saving...'
                                            : isCreating
                                            ? 'Create Theme'
                                            : 'Save Changes'}
                                    </button>
                                    {selectedTheme && (
                                        <>
                                            <button
                                                onClick={() => activateMutation.mutate(selectedTheme.id)}
                                                disabled={selectedTheme.isActive || activateMutation.isPending}
                                                className="btn-secondary"
                                            >
                                                {activateMutation.isPending ? 'Activating...' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={handleDuplicate}
                                                disabled={duplicateMutation.isPending}
                                                className="btn-secondary"
                                            >
                                                Duplicate
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this theme?')) {
                                                        deleteMutation.mutate(selectedTheme.id);
                                                    }
                                                }}
                                                disabled={selectedTheme.isActive || deleteMutation.isPending}
                                                className="btn-secondary text-red-600 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            setIsCreating(false);
                                            setSelectedTheme(null);
                                            setFormData({});
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                Select a theme to edit or create a new one
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

