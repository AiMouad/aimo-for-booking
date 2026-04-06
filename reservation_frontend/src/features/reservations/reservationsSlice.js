import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reservationService from '../../services/reservation.service';

// Async thunks
export const fetchReservations = createAsyncThunk(
  'reservations/fetchReservations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reservationService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch reservations');
    }
  }
);

export const createReservation = createAsyncThunk(
  'reservations/createReservation',
  async (reservationData, { rejectWithValue }) => {
    try {
      const response = await reservationService.create(reservationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create reservation');
    }
  }
);

export const updateReservationStatus = createAsyncThunk(
  'reservations/updateReservationStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await reservationService.updateStatus(id, status);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update reservation');
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'reservations/cancelReservation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reservationService.cancel(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to cancel reservation');
    }
  }
);

export const fetchUpcomingReservations = createAsyncThunk(
  'reservations/fetchUpcomingReservations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reservationService.getUpcoming();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch upcoming reservations');
    }
  }
);

export const fetchReservationHistory = createAsyncThunk(
  'reservations/fetchReservationHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reservationService.getHistory();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch reservation history');
    }
  }
);

export const rateReservation = createAsyncThunk(
  'reservations/rateReservation',
  async ({ id, rating, review }, { rejectWithValue }) => {
    try {
      const response = await reservationService.update(id, { rating, review });
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to rate reservation');
    }
  }
);

// Slice
const reservationsSlice = createSlice({
  name: 'reservations',
  initialState: {
    reservations: [],
    upcomingReservations: [],
    reservationHistory: [],
    currentReservation: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReservation: (state) => {
      state.currentReservation = null;
    },
    updateReservationInList: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.reservations.findIndex(r => r.id === id);
      if (index !== -1) {
        state.reservations[index] = { ...state.reservations[index], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reservations
      .addCase(fetchReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = action.payload.results || action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create reservation
      .addCase(createReservation.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.isCreating = false;
        state.reservations.unshift(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update reservation status
      .addCase(updateReservationStatus.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { id, ...updates } = action.payload;
        const index = state.reservations.findIndex(r => r.id === id);
        if (index !== -1) {
          state.reservations[index] = { ...state.reservations[index], ...updates };
        }
      })
      .addCase(updateReservationStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Cancel reservation
      .addCase(cancelReservation.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.isUpdating = false;
        const { id } = action.payload;
        const index = state.reservations.findIndex(r => r.id === id);
        if (index !== -1) {
          state.reservations[index].status = 'CANCELLED';
        }
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Fetch upcoming reservations
      .addCase(fetchUpcomingReservations.fulfilled, (state, action) => {
        state.upcomingReservations = action.payload.results || action.payload;
      })
      .addCase(fetchUpcomingReservations.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch reservation history
      .addCase(fetchReservationHistory.fulfilled, (state, action) => {
        state.reservationHistory = action.payload.results || action.payload;
      })
      .addCase(fetchReservationHistory.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Rate reservation
      .addCase(rateReservation.fulfilled, (state, action) => {
        const { id, rating, review } = action.payload;
        const index = state.reservations.findIndex(r => r.id === id);
        if (index !== -1) {
          state.reservations[index] = { ...state.reservations[index], rating, review };
        }
      })
      .addCase(rateReservation.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentReservation, updateReservationInList } = reservationsSlice.actions;
export default reservationsSlice.reducer;
