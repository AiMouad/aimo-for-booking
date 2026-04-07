import api, { handleApiError } from './api';

const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password,
      });

      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register/', userData);

      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async logout() {
    try {
      // Optional: Call backend logout endpoint to invalidate token
      await api.post('/auth/logout/');
    } catch (error) {
      // Continue with local logout even if backend call fails
      console.warn('Backend logout failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh/', {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem('accessToken', access);

      return access;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me/');
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateProfile(userData) {
    try {
      const response = await api.patch('/auth/me/', userData);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password/', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password/', {
        token,
        new_password: newPassword,
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email/', { token });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async resendVerificationEmail() {
    try {
      const response = await api.post('/auth/resend-verification/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getUsers(params = {}) {
    try {
      const response = await api.get('/auth/users/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Helper methods
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  },

  hasAnyRole(roles) {
    const user = this.getUser();
    return user && roles.includes(user.role);
  },

  // Check if user has completed profile
  isProfileComplete() {
    const user = this.getUser();
    if (!user) return false;
    
    return !!(
      user.first_name &&
      user.last_name &&
      user.email &&
      user.phone &&
      user.profile?.address_line_1
    );
  },
};

export default authService;