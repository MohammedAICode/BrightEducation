import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../lib/axios';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Helper to map backend Role to frontend UserRole
function mapRole(backendRole: string): 'ADMIN' | 'MANAGEMENT' | 'TEACHER' | 'STUDENT' | 'STAFF' {
  switch (backendRole) {
    case 'ADMIN':
      return 'ADMIN';
    case 'MANAGEMENT':
      return 'MANAGEMENT';
    case 'TEACHER':
      return 'TEACHER';
    case 'STUDENT':
      return 'STUDENT';
    case 'STAFF':
      return 'STAFF';
    default:
      return 'STUDENT'; // fallback
  }
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/auth/login', credentials);
      // Cookies are set by the server, no need to store token in localStorage
      // Call getMe to fetch full user data after login
      await dispatch(getMe());
      return { user: null }; // getMe will handle setting the user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      const userData = response.data.data;
      
      // Check if user is deleted - deny access
      if (userData.isActive === 'DELETED') {
        return rejectWithValue('Your account has been deleted. Please contact an administrator.');
      }
      
      // Check if user is active - deny access if not ACTIVE
      if (userData.isActive !== 'ACTIVE') {
        return rejectWithValue('Your account is not active. Please contact an administrator.');
      }
      
      userData.role = mapRole(userData.role);
      userData.fullName = `${userData.firstname} ${userData.lastname}`;
      return { user: userData };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await axiosInstance.get('/auth/logout');
  } catch (error) {
    // Ignore error on logout - clear local state regardless
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
