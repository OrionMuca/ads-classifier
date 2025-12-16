'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import api, { getApiUrl } from '@/lib/api';
import { getSessionIdForMigration } from '@/lib/session';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, name?: string, phone?: string, acceptedTerms?: boolean, acceptedPrivacy?: boolean) => Promise<User>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true

    // Validate token and load user on mount
    useEffect(() => {
        const validateTokenAndLoadUser = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const storedUser = localStorage.getItem('user');

                // If no token, user is not authenticated
                if (!accessToken) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                // If we have a stored user, set it optimistically
                if (storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        // Ensure stored user has all required fields
                        const userData: User = {
                            ...parsedUser,
                            createdAt: parsedUser.createdAt || new Date().toISOString(),
                            updatedAt: parsedUser.updatedAt || new Date().toISOString(),
                        };
                        setUser(userData);
                    } catch (e) {
                        // Invalid stored user, clear it
                        localStorage.removeItem('user');
                    }
                }

                // Validate token by calling profile endpoint
                try {
                    const { data } = await api.get('/users/profile');
                    // Token is valid, update user from server response
                    const userData: User = {
                        id: data.id,
                        email: data.email,
                        name: data.name,
                        role: data.role,
                        createdAt: data.createdAt || new Date().toISOString(),
                        updatedAt: data.updatedAt || new Date().toISOString(),
                    };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error: any) {
                    // Token is invalid or expired
                    if (error.response?.status === 401) {
                        // Try to refresh token
                        const refreshToken = localStorage.getItem('refreshToken');
                        const userId = localStorage.getItem('userId');

                        if (refreshToken && userId) {
                            try {
                                // Use getApiUrl for consistency
                                const apiUrl = getApiUrl();
                                const { data: refreshData } = await api.post(`${apiUrl}/auth/refresh`, {
                                    refreshToken,
                                    userId,
                                });

                                // Token refreshed successfully
                                localStorage.setItem('accessToken', refreshData.accessToken);
                                localStorage.setItem('refreshToken', refreshData.refreshToken);

                                // Get user profile with new token
                                const { data: profileData } = await api.get('/users/profile');
                                const userData: User = {
                                    id: profileData.id,
                                    email: profileData.email,
                                    name: profileData.name,
                                    role: profileData.role,
                                    createdAt: profileData.createdAt || new Date().toISOString(),
                                    updatedAt: profileData.updatedAt || new Date().toISOString(),
                                };
                                setUser(userData);
                                localStorage.setItem('user', JSON.stringify(userData));
                            } catch (refreshError) {
                                // Refresh failed, clear everything
                                localStorage.clear();
                                setUser(null);
                            }
                        } else {
                            // No refresh token, clear everything
                            localStorage.clear();
                            setUser(null);
                        }
                    } else {
                        // Other error, clear user
                        localStorage.clear();
                        setUser(null);
                    }
                }
            } catch (error) {
                // Unexpected error, clear everything
                localStorage.clear();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateTokenAndLoadUser();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
        });

        // Handle both direct response and nested data
        const data = response.data || response;
        
        // Validate response structure
        if (!data || !data.user || (!data.accessToken && !data.access_token)) {
            throw new Error('Invalid login response: missing required fields');
        }

        const accessToken = data.accessToken || data.access_token;
        const refreshToken = data.refreshToken || data.refresh_token;

        if (!accessToken || !refreshToken) {
            throw new Error('Invalid login response: missing tokens');
        }

        // Ensure user object has all required fields
        const userData: User = {
            ...data.user,
            createdAt: data.user.createdAt || new Date().toISOString(),
            updatedAt: data.user.updatedAt || new Date().toISOString(),
        };

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Merge anonymous session history to user account (non-blocking)
        // Wait a bit to ensure token is set in axios instance
        const sessionId = getSessionIdForMigration();
        if (sessionId) {
            // Don't await - let it run in background after a short delay
            setTimeout(() => {
                api.post('/search/merge-session').catch(() => {
                    // Silently fail - session merge is not critical
                });
            }, 100);
        }

        // Return user data so login page can use it for redirect
        return userData;
    }, []);

    const register = useCallback(async (email: string, password: string, name?: string, phone?: string, acceptedTerms?: boolean, acceptedPrivacy?: boolean) => {
        const response = await api.post<AuthResponse>('/auth/register', {
            email,
            password,
            name,
            phone,
            acceptedTerms: acceptedTerms ?? false,
            acceptedPrivacy: acceptedPrivacy ?? false,
        });

        // Handle both direct response and nested data
        const data = response.data || response;
        
        // Validate response structure
        if (!data || !data.user || (!data.accessToken && !data.access_token)) {
            throw new Error('Invalid registration response: missing required fields');
        }

        const accessToken = data.accessToken || data.access_token;
        const refreshToken = data.refreshToken || data.refresh_token;

        if (!accessToken || !refreshToken) {
            throw new Error('Invalid registration response: missing tokens');
        }

        // Ensure user object has all required fields
        const userData: User = {
            ...data.user,
            createdAt: data.user.createdAt || new Date().toISOString(),
            updatedAt: data.user.updatedAt || new Date().toISOString(),
        };

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Merge anonymous session history to user account (non-blocking)
        const sessionId = getSessionIdForMigration();
        if (sessionId) {
            // Don't await - let it run in background after a short delay
            setTimeout(() => {
                api.post('/search/merge-session').catch(() => {
                    // Silently fail - session merge is not critical
                });
            }, 100);
        }

        // Return user data so register page can use it for redirect
        return userData;
    }, []);

    const logout = useCallback(() => {
        localStorage.clear();
        setUser(null);
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value: AuthContextType = useMemo(() => ({
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
    }), [user, login, register, logout, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
