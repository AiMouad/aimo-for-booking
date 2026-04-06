import api from '../../services/api';

const authService = {
  async login(email, password) {
    const response = await api.post('/v1/users/login/', { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/v1/users/register/', userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getCurrentUser() {
    const response = await api.get('/v1/users/me/');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/v1/users/me/', data);
    return response.data;
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/v1/users/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  getStoredToken() {
    return localStorage.getItem('accessToken');
  },

  getStoredRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  setTokens(access, refresh) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

export default authService;
