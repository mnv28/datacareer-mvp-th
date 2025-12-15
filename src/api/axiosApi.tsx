import axios from "axios";
import { API_URL } from "./constApi";

export const apiInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to attach JWT token
apiInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage (check both 'token' and 'accessToken' for compatibility)
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        
        if (token) {
            // Ensure Authorization header is set correctly
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        // Don't redirect on 403 (trial expired) - let ProtectedRoute handle it
        return Promise.reject(error);
    }
); 