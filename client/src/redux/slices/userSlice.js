// slices/userSlice.js - Updated to include setUserDetails
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch user data
export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
  const response = await axios.get('/api/users');
  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    currentUser: null,
    filteredUser: null,
    userDetails: null, // Added userDetails to the initial state
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
    },
    setFilteredUser: (state, action) => {
      state.filteredUser = action.payload;
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload; // Setting user details
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

// Export the actions, including setUserDetails
export const { setUsers, setCurrentUser, logoutUser, setFilteredUser, setUserDetails } = userSlice.actions;

export default userSlice.reducer;
