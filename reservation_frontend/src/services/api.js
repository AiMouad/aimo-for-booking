import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aimo_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh JWT ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('aimo_refresh_token');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('aimo_access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          // Refresh failed: clear tokens and redirect to login
          localStorage.removeItem('aimo_access_token');
          localStorage.removeItem('aimo_refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ──────────────────────────────────────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/token/', credentials),
  refresh: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  blacklist: (refresh) => api.post('/auth/token/blacklist/', { refresh }),
  register: (data) => api.post('/users/', data),
  me: () => api.get('/users/me/'),
  updateMe: (data) => api.patch('/users/update_me/', data),
  changePassword: (data) => api.post('/users/change_password/', data),
  verifyEmail: (data) => api.post('/users/verify_email/', data),
  resendVerification: (email) => api.post('/users/resend_verification/', { email }),
  getWorkers: () => api.get('/users/workers/'),
  getClients: () => api.get('/users/clients/'),
};

// ──────────────────────────────────────────────────────────────────────────────
// Properties
// ──────────────────────────────────────────────────────────────────────────────
export const propertiesAPI = {
  list: (params) => api.get('/properties/', { params }),
  get: (id) => api.get(`/properties/${id}/`),
  create: (data) => api.post('/properties/', data),
  update: (id, data) => api.patch(`/properties/${id}/`, data),
  delete: (id) => api.delete(`/properties/${id}/`),
  availability: (id) => api.get(`/properties/${id}/availability/`),
  review: (id, data) => api.post(`/properties/${id}/review/`, data),
  myStats: () => api.get('/properties/my_stats/'),
  checkAvailability: (apartmentId, data) =>
    api.post(`/apartments/${apartmentId}/check_availability/`, data),
};

// ──────────────────────────────────────────────────────────────────────────────
// Bookings
// ──────────────────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  list: (params) => api.get('/bookings/', { params }),
  get: (id) => api.get(`/bookings/${id}/`),
  create: (data) => api.post('/bookings/', data),
  update: (id, data) => api.patch(`/bookings/${id}/`, data),
  delete: (id) => api.delete(`/bookings/${id}/`),
  confirm: (id) => api.post(`/bookings/${id}/confirm/`),
  refuse: (id, data) => api.post(`/bookings/${id}/refuse/`, data),
  cancel: (id) => api.post(`/bookings/${id}/cancel/`),
  myBookings: (params) => api.get('/my-bookings/', { params }),
};

// ──────────────────────────────────────────────────────────────────────────────
// Analytics
// ──────────────────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  overview: () => api.get('/analytics/overview/'),
  monthly: (months) => api.get('/analytics/monthly/', { params: { months } }),
  byProperty: () => api.get('/analytics/by-property/'),
  recentBookings: () => api.get('/analytics/recent-bookings/'),
  occupancy: () => api.get('/analytics/occupancy/'),
};

// ──────────────────────────────────────────────────────────────────────────────
// Chatbot
// ──────────────────────────────────────────────────────────────────────────────
export const chatbotAPI = {
  chat: (data) => api.post('/chatbot/chat/', data),
  suggest: () => api.get('/chatbot/suggest/'),
  tips: () => api.get('/chatbot/tips/'),
  sessions: () => api.get('/chatbot/conversations/'),
  sessionMessages: (id) => api.get(`/chatbot/conversations/${id}/messages/`),
  clearHistory: () => api.delete('/chatbot/conversations/clear_history/'),
};

// ──────────────────────────────────────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  unreadCount: () => api.get('/notifications/unread_count/'),
  markRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
};

// ──────────────────────────────────────────────────────────────────────────────
// Workers
// ──────────────────────────────────────────────────────────────────────────────
export const workersAPI = {
  list: () => api.get('/workers/'),
  myProfile: () => api.get('/workers/my_profile/'),
  myBookings: () => api.get('/workers/my_bookings/'),
  assignProperties: (workerId, propertyIds) =>
    api.post(`/workers/${workerId}/assign_properties/`, { property_ids: propertyIds }),
};