// src/redux/slices/teamSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch the roster for a given user
export const fetchRoster = createAsyncThunk(
  'team/fetchRoster',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/users/${userId}/roster`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch roster');
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState: {
    roster: [],      // holds fetched roster entries
    status: 'idle',  // idle | loading | succeeded | failed
    error: null      // error message if fetch fails
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoster.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRoster.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roster = action.payload;
      })
      .addCase(fetchRoster.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default teamSlice.reducer;
