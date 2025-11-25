import axios from 'axios';

// Get API URL from environment variable (Next.js standard approach)
// Set NEXT_PUBLIC_API_URL in .env.local for local development
// For mobile access: NEXT_PUBLIC_API_URL=http://192.168.1.7:3000 (your PC's IP)
const getApiUrl = (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
        console.error('❌ NEXT_PUBLIC_API_URL is not set!');
        console.error('📝 Please create apps/web/.env.local and set:');
        console.error('   NEXT_PUBLIC_API_URL=http://localhost:3000');
        console.error('   or for mobile: NEXT_PUBLIC_API_URL=http://YOUR_PC_IP:3000');
        // Fallback to localhost in development
        return 'http://localhost:3000';
    }
    
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
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('🌐 API Request:', {
            method: config.method?.toUpperCase() || 'GET',
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
        });
    }
    
    // Add authentication token (client-side only)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
