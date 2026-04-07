import api from './api';
import { mockServices, mockCategories } from '../mocks/services';

const serviceService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/services/', { params });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      // Return mock data when API fails
      return {
        results: mockServices,
        count: mockServices.length,
        next: null,
        previous: null
      };
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/services/${id}/`);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      // Return mock service when API fails
      const service = mockServices.find(s => s.id === parseInt(id));
      if (!service) {
        throw new Error('Service not found');
      }
      return service;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/services/', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/services/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update service:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await api.delete(`/services/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete service:', error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const response = await api.get('/services/categories/');
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      // Return mock categories when API fails
      return mockCategories;
    }
  },

  async search(query) {
    try {
      const response = await api.post('/search/smart/', { query });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock search:', error);
      // Simple mock search when API fails
      const filteredServices = mockServices.filter(service =>
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase())
      );
      return {
        results: filteredServices,
        count: filteredServices.length
      };
    }
  },
};

export default serviceService;