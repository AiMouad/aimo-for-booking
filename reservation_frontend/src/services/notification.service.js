import api from './api';

const notificationService = {
  async getAll(params = {}) {
    const response = await api.get('/v1/notifications/', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/v1/notifications/${id}/`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/v1/notifications/${id}/mark_read/`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/v1/notifications/mark_all_read/');
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/v1/notifications/unread_count/');
    return response.data;
  },

  async delete(id) {
    await api.delete(`/v1/notifications/${id}/`);
  },

  async deleteAll() {
    await api.delete('/v1/notifications/');
  },
};

export default notificationService;
