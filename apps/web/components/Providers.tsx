'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { useToast, Toast } from '@/components/admin/Toast';
import React, { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => {
        return new QueryClient({
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false, // Prevent automatic refetch on window focus
                    refetchOnMount: false, // Don't refetch on mount if data is fresh
                    refetchOnReconnect: false, // Don't refetch on reconnect
                    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
                    retry: 1, // Only retry once on failure
                },
            },
        });
    });


    // Ensure nextjs-portal is properly positioned in the DOM
    useEffect(() => {
        const fixPortalPosition = () => {
            const portal = document.querySelector('nextjs-portal');
            if (portal && portal.parentElement !== document.body) {
                // Move portal to body if it's in the wrong location
                document.body.appendChild(portal);
            }
        };

        // Fix immediately
        fixPortalPosition();

        // Watch for portal creation/movement
        const observer = new MutationObserver(() => {
            fixPortalPosition();
        });

        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });

        // Also check periodically in case portal is created after observer starts
        const interval = setInterval(fixPortalPosition, 500);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    // Suppress console errors/warnings in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // Suppress WebSocket HMR connection errors - catch them at multiple levels
            const originalError = console.error;
            console.error = function(...args: any[]) {
                const errorMessage = args[0];
                // Suppress WebSocket HMR errors (check multiple ways)
                if (
                    (typeof errorMessage === 'string' && errorMessage.includes('WebSocket connection to')) ||
                    (args.some((arg: any) => typeof arg === 'string' && arg.includes('web-socket.js'))) ||
                    (args.some((arg: any) => typeof arg === 'string' && arg.includes('webpack-hmr')))
                ) {
                    return; // Suppress WebSocket HMR errors
                }
                // Suppress encode-uri-path errors (might be related to HMR)
                if (typeof errorMessage === 'string' && errorMessage.includes('encode-uri-path')) {
                    return; // Suppress encode-uri-path errors
                }
                originalError.apply(console, args);
            };
            
            // Intercept WebSocket errors at the source - override WebSocket constructor
            if (typeof window !== 'undefined' && window.WebSocket) {
                const OriginalWebSocket = window.WebSocket;
                (window as any).WebSocket = class extends OriginalWebSocket {
                    constructor(url: string | URL, protocols?: string | string[]) {
                        // Suppress HMR WebSocket connections completely
                        if (typeof url === 'string' && url.includes('webpack-hmr')) {
                            // Don't create the WebSocket at all - return a dummy object that mimics WebSocket
                            // Use getters for read-only properties to avoid "Cannot set property" errors
                            const dummy: any = {
                                // Use getters for read-only properties
                                get readyState() { return 3; }, // CLOSED
                                get url() { return ''; },
                                get protocol() { return ''; },
                                get extensions() { return ''; },
                                get binaryType() { return 'blob'; },
                                set binaryType(_: any) {}, // Allow setting but do nothing
                                close: () => {},
                                send: () => {},
                                addEventListener: () => {},
                                removeEventListener: () => {},
                                dispatchEvent: () => true,
                                CONNECTING: 0,
                                OPEN: 1,
                                CLOSING: 2,
                                CLOSED: 3,
                            };
                            return dummy;
                        }
                        super(url, protocols);
                    }
                };
            }
            
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
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </ThemeProvider>
                </SocketProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

// Toast Provider component
function ToastProvider({ children }: { children: React.ReactNode }) {
    const { toast, hideToast } = useToast();

    return (
        <>
            {children}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </>
    );
}
