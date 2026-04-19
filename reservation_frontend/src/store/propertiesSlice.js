import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertiesAPI } from '../services/api';

export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await propertiesAPI.list(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchPropertyDetail = createAsyncThunk(
  'properties/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await propertiesAPI.get(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState: {
    items: [],
    selected: null,
    isLoading: false,
    error: null,
    pagination: { count: 0, next: null, previous: null },
  },
  reducers: {
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProperties.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        // Handle paginated or direct array response
        if (Array.isArray(payload)) {
          state.items = payload;
        } else {
          state.items = payload.results || payload;
          state.pagination = { count: payload.count, next: payload.next, previous: payload.previous };
        }
      })
      .addCase(fetchProperties.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(fetchPropertyDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyDetail.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.selected = payload;
      })
      .addCase(fetchPropertyDetail.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        state.selected = null;
      });
  },
});

export const { clearSelected } = propertiesSlice.actions;
export default propertiesSlice.reducer;
