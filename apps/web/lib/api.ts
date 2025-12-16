import axios from 'axios';
import { getSessionId } from './session';

// Get API URL from environment variable (Next.js standard approach)
// Set NEXT_PUBLIC_API_URL in .env.local for local development
// For mobile access: NEXT_PUBLIC_API_URL=http://192.168.1.7:3000 (your PC's IP)
export const getApiUrl = (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
        // Fallback to localhost:3001 (API port, not web port)
        return 'http://localhost:3001';
    }
    
    // In Docker, server-side requests need to use service name
    // Client-side (browser) requests need to use localhost or host IP
    if (typeof window === 'undefined') {
        // Server-side (SSR): Use Docker service name if available, otherwise use env var
        // Check if we're in Docker by looking for the service name
        if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
            // Replace localhost with service name for server-side requests in Docker
            return apiUrl.replace('localhost', 'api').replace('127.0.0.1', 'api');
        }
    }
    // Client-side: Use the env var as-is (browser will resolve localhost correctly)
    
    return apiUrl;
};

// Create axios instance (baseURL will be set dynamically per request)
export const api = axios.create({
    timeout: 30000, // 30 second timeout for mobile networks
    withCredentials: false, // Don't send cookies (we use JWT tokens instead)
    xsrfCookieName: undefined, // Disable XSRF cookie handling
    xsrfHeaderName: undefined, // Disable XSRF header handling
});

// Request interceptor: Set baseURL from env and add auth token
api.interceptors.request.use((config) => {
    const apiUrl = getApiUrl();
    
    // Set baseURL on the config object
    config.baseURL = apiUrl;
    api.defaults.baseURL = apiUrl;
    
    // Add authentication token and session ID (client-side only)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add session ID for anonymous user tracking
        const sessionId = getSessionId();
        if (sessionId) {
            config.headers['X-Session-Id'] = sessionId;
        }
    }
    
    // Don't set Content-Type for FormData - browser will set it with boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    
    return config;
});

// Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const userId = localStorage.getItem('userId');

                if (refreshToken && userId) {
                    // Get API URL from environment variable
                    const apiUrl = getApiUrl();
                    
                    const { data } = await axios.post(`${apiUrl}/auth/refresh`, {
                        refreshToken,
                        userId,
                    });

                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);

                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.clear();
                
                // Only redirect to login if we're not already on a public page
                if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname;
                    const publicPaths = ['/auth/login', '/auth/register', '/'];
                    
                    // Don't redirect if already on a public page or if it's a public API endpoint
                    const isPublicPath = publicPaths.includes(currentPath);
                    const isPublicEndpoint = originalRequest.url?.includes('/search') || 
                                            originalRequest.url?.includes('/categories') || 
                                            originalRequest.url?.includes('/locations') ||
                                            originalRequest.url?.includes('/ads') ||
                                            originalRequest.url?.includes('/theme');
                    
                    if (!isPublicPath && !isPublicEndpoint) {
                        window.location.href = '/auth/login';
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
