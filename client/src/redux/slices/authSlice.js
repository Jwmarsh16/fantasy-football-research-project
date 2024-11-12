// authSlice.js - Ensure currentUser is set properly when loginUser action is successful
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to handle login
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/auth/login', credentials, { withCredentials: true });
    // Ensure that the response contains the necessary user data
    if (response.data && response.data.user) {
      return response.data.user;
    }
    return response.data; // If the structure is different, return as is
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data.message : 'Login failed');
  }
});

// Async thunk to handle registration
export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/auth/register', userData, { withCredentials: true });
    if (response.data && response.data.user) {
      return response.data.user;
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data.message : 'Registration failed');
  }
});

// Async thunk to handle logout
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/auth/logout', {}, { withCredentials: true });
    // No return value necessary as we're just clearing user state
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data.message : 'Logout failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isAuthenticated: false, // Track authentication status
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login Cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
        state.isAuthenticated = true; // Set to true when login is successful
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register Cases
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
        state.isAuthenticated = true; // Automatically authenticate after successful registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout Cases
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.currentUser = null;
        state.isAuthenticated = false; // Set to false on logout
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
