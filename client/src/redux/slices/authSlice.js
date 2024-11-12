// authSlice.js - Ensure currentUser is set properly when loginUser action is successful
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

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
    // Get the CSRF token from cookies
    const csrfToken = Cookies.get('csrf_access_token');
    
    const response = await axios.post(
      '/api/auth/logout', 
      {},
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,  // Add CSRF token to the request headers
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data.message : 'Logout failed');
  }
});

// Async thunk to handle deleting user
export const deleteUser = createAsyncThunk('auth/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    // Get the CSRF token from cookies
    const csrfToken = Cookies.get('csrf_access_token');
    
    await axios.delete(`/api/users/${userId}`, {
      headers: {
        'X-CSRF-TOKEN': csrfToken,  // Add CSRF token to the request headers
      },
      withCredentials: true,
    });
    
    // No return data necessary since we are just deleting the user
    return userId;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data.message : 'Delete user failed');
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
      })
      // Delete User Cases
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.status = 'idle';
        state.currentUser = null;
        state.isAuthenticated = false; // User is deleted, so they are no longer authenticated
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
