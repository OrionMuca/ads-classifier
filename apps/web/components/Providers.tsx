'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false, // Prevent automatic refetch on window focus
                refetchOnMount: false, // Don't refetch on mount if data is fresh
                refetchOnReconnect: false, // Don't refetch on reconnect
                staleTime: 30 * 1000, // Consider data fresh for 30 seconds
                retry: 1, // Only retry once on failure
            },
        },
    }));

    // Suppress console errors/warnings in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // Suppress WebSocket HMR connection errors
            const originalError = console.error;
            console.error = function(...args: any[]) {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('WebSocket connection to')) {
                    return; // Suppress WebSocket HMR errors
                }
                originalError.apply(console, args);
            };
            
            // Suppress RSS_Basic_Detect.js warnings (likely from browser extension)
            const originalWarn = console.warn;
            console.warn = function(...args: any[]) {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('RSS_Basic_Detect')) {
                    return; // Suppress RSS_Basic_Detect warnings
                }
                originalWarn.apply(console, args);
            };

            // Cleanup on unmount
            return () => {
                console.error = originalError;
                console.warn = originalWarn;
            };
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SocketProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </SocketProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
