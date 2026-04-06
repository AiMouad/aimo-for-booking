import api, { handleApiError } from './api';

const propertyService = {
  // Properties
  async getProperties(params = {}) {
    try {
      const response = await api.get('/properties/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getProperty(id) {
    try {
      const response = await api.get(`/properties/${id}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async createProperty(propertyData) {
    try {
      const response = await api.post('/properties/', propertyData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateProperty(id, propertyData) {
    try {
      const response = await api.put(`/properties/${id}/`, propertyData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteProperty(id) {
    try {
      await api.delete(`/properties/${id}/`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Apartments
  async getApartments(params = {}) {
    try {
      const response = await api.get('/apartments/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getApartment(id) {
    try {
      const response = await api.get(`/apartments/${id}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async createApartment(apartmentData) {
    try {
      const response = await api.post('/apartments/', apartmentData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateApartment(id, apartmentData) {
    try {
      const response = await api.put(`/apartments/${id}/`, apartmentData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteApartment(id) {
    try {
      await api.delete(`/apartments/${id}/`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Availability
  async checkAvailability(apartmentId, checkIn, checkOut, numGuests = 1) {
    try {
      const response = await api.post(`/apartments/${apartmentId}/availability/`, {
        check_in: checkIn,
        check_out: checkOut,
        num_guests: numGuests,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search
  async searchProperties(searchParams) {
    try {
      const response = await api.post('/properties/search/', searchParams);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Property Images
  async uploadPropertyImage(propertyId, imageData) {
    try {
      const formData = new FormData();
      formData.append('image', imageData.file);
      formData.append('caption', imageData.caption || '');
      formData.append('is_primary', imageData.is_primary || false);
      formData.append('order', imageData.order || 0);

      const response = await api.post(`/properties/${propertyId}/images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deletePropertyImage(imageId) {
    try {
      await api.delete(`/property-images/${imageId}/`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Apartment Images
  async uploadApartmentImage(apartmentId, imageData) {
    try {
      const formData = new FormData();
      formData.append('image', imageData.file);
      formData.append('caption', imageData.caption || '');
      formData.append('is_primary', imageData.is_primary || false);
      formData.append('order', imageData.order || 0);

      const response = await api.post(`/apartments/${apartmentId}/images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteApartmentImage(imageId) {
    try {
      await api.delete(`/apartment-images/${imageId}/`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Property Statistics (for owners)
  async getPropertyStatistics(propertyId) {
    try {
      const response = await api.get(`/properties/${propertyId}/statistics/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Calendar availability
  async getPropertyCalendar(propertyId, year, month) {
    try {
      const response = await api.get(`/properties/${propertyId}/calendar/`, {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Featured properties
  async getFeaturedProperties() {
    try {
      const response = await api.get('/properties/featured/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Properties by owner
  async getOwnerProperties(ownerId = null) {
    try {
      const url = ownerId ? `/users/${ownerId}/properties/` : '/properties/my/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Property types
  async getPropertyTypes() {
    try {
      const response = await api.get('/properties/types/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Amenities
  async getAmenities() {
    try {
      const response = await api.get('/properties/amenities/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Helper methods
  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  },

  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  },

  formatAddress(property) {
    const parts = [
      property.address_line_1,
      property.city,
      property.state,
      property.postal_code,
      property.country,
    ];
    return parts.filter(Boolean).join(', ');
  },

  calculateTotalPrice(apartment, numNights) {
    const subtotal = parseFloat(apartment.price_per_night) * numNights;
    const cleaningFee = parseFloat(apartment.cleaning_fee) || 0;
    const serviceFee = parseFloat(apartment.service_fee) || 0;
    return subtotal + cleaningFee + serviceFee;
  },

  validateBookingDates(checkIn, checkOut) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today) {
      return { valid: false, message: 'Check-in date cannot be in the past' };
    }

    if (checkOutDate <= checkInDate) {
      return { valid: false, message: 'Check-out date must be after check-in date' };
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (checkInDate > maxDate) {
      return { valid: false, message: 'Check-in date cannot be more than 1 year in advance' };
    }

    return { valid: true };
  },
};

export default propertyService;
