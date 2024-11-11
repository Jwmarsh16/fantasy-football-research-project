// slices/userSlice.js - Updated to use thunkAPI for handling async actions
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch user data by ID
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`/api/users/${userId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response ? error.response.data.message : 'Failed to fetch user');
    }
  }
);

// Async thunk to fetch all users
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/api/users', { withCredentials: true });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response ? error.response.data.message : 'Failed to fetch users');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    currentUser: null,
    filteredUser: null,
    userDetails: null,
    error: null, // Added error state for better error tracking
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.userDetails = null;
      state.status = 'idle';
    },
    setFilteredUser: (state, action) => {
      state.filteredUser = action.payload;
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users Cases
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch users';
      })
      // Fetch User by ID Cases
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userDetails = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch user details';
      });
  },
});

// Export the actions, including setUserDetails
export const { setUsers, setCurrentUser, logoutUser, setFilteredUser, setUserDetails } = userSlice.actions;

export default userSlice.reducer;
