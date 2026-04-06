import api, { handleApiError } from './api';

const reservationService = {
  // Bookings
  async getBookings(params = {}) {
    try {
      const response = await api.get('/bookings/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getBooking(id) {
    try {
      const response = await api.get(`/bookings/${id}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings/', bookingData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateBooking(id, bookingData) {
    try {
      const response = await api.put(`/bookings/${id}/`, bookingData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteBooking(id) {
    try {
      await api.delete(`/bookings/${id}/`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Booking actions
  async confirmBooking(id) {
    try {
      const response = await api.post(`/bookings/${id}/confirm/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async cancelBooking(id, reason = '') {
    try {
      const response = await api.post(`/bookings/${id}/cancel/`, { reason });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async completeBooking(id) {
    try {
      const response = await api.post(`/bookings/${id}/complete/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async markNoShow(id) {
    try {
      const response = await api.post(`/bookings/${id}/mark_no_show/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // My bookings (for current user)
  async getMyBookings(params = {}) {
    try {
      const response = await api.get('/bookings/my/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Booking statistics
  async getBookingStatistics(params = {}) {
    try {
      const response = await api.get('/bookings/statistics/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Booking availability check
  async checkBookingAvailability(id) {
    try {
      const response = await api.get(`/bookings/${id}/availability/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Payments
  async getPayments(bookingId = null) {
    try {
      const url = bookingId ? `/bookings/${bookingId}/payments/` : '/payments/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments/', paymentData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async processPayment(paymentId, transactionId, gatewayResponse = {}) {
    try {
      const response = await api.post(`/payments/${paymentId}/process_payment/`, {
        transaction_id: transactionId,
        gateway_response: gatewayResponse,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async refundPayment(paymentId, refundAmount, refundReason = '') {
    try {
      const response = await api.post(`/payments/${paymentId}/refund/`, {
        refund_amount: refundAmount,
        refund_reason: refundReason,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Booking search
  async searchBookings(searchParams) {
    try {
      const response = await api.post('/bookings/search/', searchParams);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Booking calendar
  async getBookingCalendar(propertyId, year, month) {
    try {
      const response = await api.get(`/properties/${propertyId}/booking-calendar/`, {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upcoming bookings
  async getUpcomingBookings(days = 30) {
    try {
      const response = await api.get('/bookings/upcoming/', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Booking history
  async getBookingHistory(params = {}) {
    try {
      const response = await api.get('/bookings/history/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Helper methods
  calculateBookingPrice(apartment, checkIn, checkOut, numGuests = 1) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (numNights <= 0) {
      return { error: 'Invalid booking dates' };
    }

    const subtotal = parseFloat(apartment.price_per_night) * numNights;
    const cleaningFee = parseFloat(apartment.cleaning_fee) || 0;
    const serviceFee = parseFloat(apartment.service_fee) || 0;
    const total = subtotal + cleaningFee + serviceFee;

    return {
      num_nights: numNights,
      subtotal: subtotal,
      cleaning_fee: cleaningFee,
      service_fee: serviceFee,
      total_amount: total,
    };
  },

  validateBookingData(bookingData, apartment) {
    const errors = [];

    // Validate dates
    if (!bookingData.check_in || !bookingData.check_out) {
      errors.push('Check-in and check-out dates are required');
    }

    if (bookingData.check_in >= bookingData.check_out) {
      errors.push('Check-out date must be after check-in date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(bookingData.check_in) < today) {
      errors.push('Check-in date cannot be in the past');
    }

    // Validate guests
    if (!bookingData.num_guests || bookingData.num_guests < 1) {
      errors.push('Number of guests must be at least 1');
    }

    if (apartment && bookingData.num_guests > apartment.max_guests) {
      errors.push(`Maximum ${apartment.max_guests} guests allowed`);
    }

    // Validate guest information
    if (!bookingData.guest_first_name || !bookingData.guest_last_name) {
      errors.push('Guest first and last names are required');
    }

    if (!bookingData.guest_email) {
      errors.push('Guest email is required');
    }

    return errors;
  },

  formatBookingStatus(status) {
    const statusMap = {
      pending: 'Pending Confirmation',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
      no_show: 'No Show',
      refunded: 'Refunded',
    };
    return statusMap[status] || status;
  },

  formatPaymentStatus(status) {
    const statusMap = {
      pending: 'Pending',
      partial: 'Partially Paid',
      paid: 'Fully Paid',
      refunded: 'Refunded',
      failed: 'Failed',
    };
    return statusMap[status] || status;
  },

  getBookingStatusColor(status) {
    const colorMap = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info',
      no_show: 'secondary',
      refunded: 'primary',
    };
    return colorMap[status] || 'secondary';
  },

  canCancelBooking(booking) {
    if (!booking) return false;
    
    const now = new Date();
    const checkIn = new Date(booking.check_in);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
    
    // Can cancel if more than 24 hours before check-in and status allows it
    return hoursUntilCheckIn > 24 && ['pending', 'confirmed'].includes(booking.status);
  },

  canReviewBooking(booking) {
    if (!booking) return false;
    
    const now = new Date();
    const checkOut = new Date(booking.check_out);
    
    return (
      booking.status === 'completed' &&
      !booking.is_guest_reviewed &&
      checkOut < now
    );
  },

  getOutstandingBalance(booking) {
    if (!booking) return 0;
    return parseFloat(booking.total_amount) - parseFloat(booking.amount_paid || 0);
  },

  isFullyPaid(booking) {
    if (!booking) return false;
    return parseFloat(booking.amount_paid || 0) >= parseFloat(booking.total_amount);
  },
};

export default reservationService;