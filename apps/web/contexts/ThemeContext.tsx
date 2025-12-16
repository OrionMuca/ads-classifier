'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
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

interface ThemeContextType {
    theme: Theme | null;
    isLoading: boolean;
    applyTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme | null>(null);
    const previousThemeIdRef = useRef<string | null>(null);

    // Fetch active theme (non-blocking - fails gracefully)
    const { data: activeTheme, isLoading } = useQuery({
        queryKey: ['active-theme'],
        queryFn: async () => {
            try {
                const { data } = await api.get('/theme/active');
                return data;
            } catch (error) {
                // Fail gracefully - return null if theme fetch fails
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus (prevents unnecessary refreshes)
        refetchOnMount: false, // CRITICAL: Don't refetch on mount
        retry: 1, // Only retry once
        retryDelay: 1000, // Wait 1 second before retry
    });

    // Separate CSS application from state update to prevent loops
    const applyThemeCSS = useCallback((themeData: Theme) => {
        if (!themeData) return;

        const root = document.documentElement;

        // Apply primary colors
        root.style.setProperty('--primary-50', themeData.primary50);
        root.style.setProperty('--primary-100', themeData.primary100);
        root.style.setProperty('--primary-200', themeData.primary200);
        root.style.setProperty('--primary-300', themeData.primary300);
        root.style.setProperty('--primary-400', themeData.primary400);
        root.style.setProperty('--primary-500', themeData.primary500);
        root.style.setProperty('--primary-600', themeData.primary600);
        root.style.setProperty('--primary-700', themeData.primary700);
        root.style.setProperty('--primary-800', themeData.primary800);
        root.style.setProperty('--primary-900', themeData.primary900);

        // Apply secondary colors
        root.style.setProperty('--secondary-50', themeData.secondary50);
        root.style.setProperty('--secondary-100', themeData.secondary100);
        root.style.setProperty('--secondary-200', themeData.secondary200);
        root.style.setProperty('--secondary-300', themeData.secondary300);
        root.style.setProperty('--secondary-400', themeData.secondary400);
        root.style.setProperty('--secondary-500', themeData.secondary500);
        root.style.setProperty('--secondary-600', themeData.secondary600);
        root.style.setProperty('--secondary-700', themeData.secondary700);
        root.style.setProperty('--secondary-800', themeData.secondary800);
        root.style.setProperty('--secondary-900', themeData.secondary900);

        // Apply accent colors
        root.style.setProperty('--accent-50', themeData.accent50);
        root.style.setProperty('--accent-100', themeData.accent100);
        root.style.setProperty('--accent-200', themeData.accent200);
        root.style.setProperty('--accent-300', themeData.accent300);
        root.style.setProperty('--accent-400', themeData.accent400);
        root.style.setProperty('--accent-500', themeData.accent500);
        root.style.setProperty('--accent-600', themeData.accent600);
        root.style.setProperty('--accent-700', themeData.accent700);
        root.style.setProperty('--accent-800', themeData.accent800);
        root.style.setProperty('--accent-900', themeData.accent900);

        // Apply UI colors
        root.style.setProperty('--theme-background', themeData.background);
        root.style.setProperty('--theme-surface', themeData.surface);
        root.style.setProperty('--theme-text-primary', themeData.textPrimary);
        root.style.setProperty('--theme-text-secondary', themeData.textSecondary);

        // Apply branding
        if (themeData.logoUrl) {
            root.style.setProperty('--theme-logo-url', `url(${themeData.logoUrl})`);
        }
        if (themeData.faviconUrl) {
            // Update favicon
            const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (link) {
                link.href = themeData.faviconUrl;
            } else {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = themeData.faviconUrl;
                document.head.appendChild(newLink);
            }
        }
    }, []);

    // Apply theme ONLY when theme ID changes (not when object reference changes)
    useEffect(() => {
        if (!activeTheme) return;
        
        const currentThemeId = activeTheme.id;
        
        // Only update if theme ID actually changed
        if (previousThemeIdRef.current === currentThemeId) {
            return; // Theme hasn't changed, skip update to prevent loop
        }

        previousThemeIdRef.current = currentThemeId;
        applyThemeCSS(activeTheme);
        setTheme(activeTheme);
    }, [activeTheme?.id, applyThemeCSS]);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        theme,
        isLoading,
        applyTheme: applyThemeCSS,
    }), [theme, isLoading, applyThemeCSS]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

