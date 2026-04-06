import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import serviceService from '../../services/service.service';

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await serviceService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch services');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await serviceService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch service');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'services/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceService.getCategories();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

export const searchServices = createAsyncThunk(
  'services/searchServices',
  async (query, { rejectWithValue }) => {
    try {
      const response = await serviceService.search(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Search failed');
    }
  }
);

// Slice
const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    categories: [],
    currentService: null,
    isLoading: false,
    error: null,
    searchResults: [],
    isSearching: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload.results || action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch service by ID
      .addCase(fetchServiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search services
      .addCase(searchServices.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.results || action.payload;
      })
      .addCase(searchServices.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentService, clearSearchResults } = servicesSlice.actions;
export default servicesSlice.reducer;
