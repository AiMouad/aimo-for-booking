import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

// ── Async thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('aimo_access_token', data.access);
      localStorage.setItem('aimo_refresh_token', data.refresh);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.response?.data ||
        'Login failed. Check your credentials.'
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.me();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.register(userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.details || error.response?.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem('aimo_refresh_token');
      if (refresh) await authAPI.blacklist(refresh);
    } catch {
      // Ignore blacklist errors
    } finally {
      localStorage.removeItem('aimo_access_token');
      localStorage.removeItem('aimo_refresh_token');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: !!localStorage.getItem('aimo_access_token'),
    isLoading: false,
    error: null,
    registrationSuccess: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearRegistration: (state) => { state.registrationSuccess = false; },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('aimo_access_token');
      localStorage.removeItem('aimo_refresh_token');
    },
  },
  extraReducers: (builder) => {
    builder

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = payload.user;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = typeof payload === 'string' ? payload : 'Login failed.';
      })

      // Fetch Me
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, clearRegistration } = authSlice.actions;
export const logout = authSlice.actions.logout;
export default authSlice.reducer;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectAuthUser = (state) => state.auth.user;
export const selectRegistrationSuccess = (state) => state.auth.registrationSuccess;
