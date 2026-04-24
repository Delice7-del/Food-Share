import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        // Multi-session support: Pick the token based on the current portal path
        const isDonorPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/donor');
        const isReceiverPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/receiver');
        
        let token = null;
        if (isDonorPath) token = localStorage.getItem('token_donor');
        else if (isReceiverPath) token = localStorage.getItem('token_receiver');
        
        // Fallback to legacy token if role-specific one isn't found
        if (!token) token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
