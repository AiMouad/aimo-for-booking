import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingsAPI } from '../services/api';

export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await bookingsAPI.list(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMine',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await bookingsAPI.myBookings(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await bookingsAPI.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'bookings/confirm',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await bookingsAPI.confirm(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await bookingsAPI.cancel(id);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: [],
    myItems: [],
    isLoading: false,
    isCreating: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => { state.isLoading = true; })
      .addCase(fetchBookings.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.items = Array.isArray(payload) ? payload : payload.results || [];
      })
      .addCase(fetchBookings.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(fetchMyBookings.fulfilled, (state, { payload }) => {
        state.myItems = Array.isArray(payload) ? payload : payload.results || [];
      })
      .addCase(createBooking.pending, (state) => { state.isCreating = true; })
      .addCase(createBooking.fulfilled, (state, { payload }) => {
        state.isCreating = false;
        state.myItems.unshift(payload);
      })
      .addCase(createBooking.rejected, (state, { payload }) => {
        state.isCreating = false;
        state.error = payload;
      })
      .addCase(confirmBooking.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((b) => b.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(cancelBooking.fulfilled, (state, { payload }) => {
        const idx = state.myItems.findIndex((b) => b.id === payload.id);
        if (idx !== -1) state.myItems[idx].status = 'cancelled';
      });
  },
});

export const { clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
