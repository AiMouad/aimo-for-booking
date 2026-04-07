import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`API Error: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, error.response?.data);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login only if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle specific error cases
    if (error.response?.status === 429) {
      // Rate limit exceeded
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      }
    }

    if (error.response?.status === 500) {
      console.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Generate unique request ID for tracking
function generateRequestId() {
  return Math.random().toString(36).substr(2, 9);
}

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { type: 'validation', message: data.detail || 'Invalid data provided', errors: data };
      case 401:
        return { type: 'authentication', message: 'Authentication required' };
      case 403:
        return { type: 'authorization', message: 'Permission denied' };
      case 404:
        return { type: 'not_found', message: 'Resource not found' };
      case 429:
        return { type: 'rate_limit', message: 'Too many requests. Please try again later.' };
      case 500:
        return { type: 'server_error', message: 'Server error. Please try again later.' };
      default:
        return { type: 'unknown', message: data.detail || 'An error occurred' };
    }
  } else if (error.request) {
    // Request was made but no response received
    return { type: 'network', message: 'Network error. Please check your connection.' };
  } else {
    // Something else happened
    return { type: 'client', message: error.message || 'An unexpected error occurred' };
  }
};

export default api;