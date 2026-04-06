import api from './api';

const serviceService = {
  async getAll(params = {}) {
    const response = await api.get('/v1/services/', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/v1/services/${id}/`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/v1/services/', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/v1/services/${id}/`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/v1/services/${id}/`);
  },

  async getCategories() {
    const response = await api.get('/v1/services/categories/');
    return response.data;
  },

  async search(query) {
    const response = await api.post('/v1/search/smart/', { query });
    return response.data;
  },
};

export default serviceService;