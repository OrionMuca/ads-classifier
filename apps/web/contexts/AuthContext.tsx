'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types';
import api, { getApiUrl } from '@/lib/api';
import { getSessionIdForMigration } from '@/lib/session';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
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
                        setUser(parsedUser);
                    } catch (e) {
                        // Invalid stored user, clear it
                        localStorage.removeItem('user');
                    }
                }

                // Validate token by calling profile endpoint
                try {
                    const { data } = await api.get('/users/profile');
                    // Token is valid, update user from server response
                    const userData = {
                        id: data.id,
                        email: data.email,
                        name: data.name,
                        role: data.role,
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
                                const userData = {
                                    id: profileData.id,
                                    email: profileData.email,
                                    name: profileData.name,
                                    role: profileData.role,
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
                console.error('Auth validation error:', error);
                localStorage.clear();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateTokenAndLoadUser();
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
        });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // Merge anonymous session history to user account
        const sessionId = getSessionIdForMigration();
        if (sessionId) {
            try {
                await api.post('/search/merge-session');
            } catch (error) {
                // Silently fail - session merge is not critical
                console.warn('Failed to merge session history:', error);
            }
        }
    };

    const register = async (email: string, password: string, name?: string) => {
        const { data } = await api.post<AuthResponse>('/auth/register', {
            email,
            password,
            name,
        });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // Merge anonymous session history to user account
        const sessionId = getSessionIdForMigration();
        if (sessionId) {
            try {
                await api.post('/search/merge-session');
            } catch (error) {
                // Silently fail - session merge is not critical
                console.warn('Failed to merge session history:', error);
            }
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
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
