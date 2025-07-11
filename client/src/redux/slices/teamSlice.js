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

// Async thunk to add a player to the roster
export const addToRoster = createAsyncThunk(
  'team/addToRoster',
  async ({ userId, playerId, slot, isStarter }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/users/${userId}/roster`, {
        player_id: playerId,      // send player ID
        slot,                     // send roster slot
        is_starter: isStarter     // send starter flag
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add to roster');
    }
  }
);

// **NEW**: Async thunk to remove a roster entry by ID
export const removeFromRoster = createAsyncThunk(
  'team/removeFromRoster',
  async (entryId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/roster/${entryId}`);  // call DELETE endpoint
      return entryId;                                 // return the deleted ID
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to remove from roster');
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState: {
    roster: [],      // holds fetched roster entries
    status: 'idle',  // idle | loading | succeeded | failed
    error: null      // error message if fetch/add/remove fails
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRoster handlers
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
      })

      // addToRoster handlers
      .addCase(addToRoster.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addToRoster.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roster.push(action.payload); // append new roster entry
      })
      .addCase(addToRoster.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // **NEW**: removeFromRoster handlers
      .addCase(removeFromRoster.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(removeFromRoster.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // remove the entry with matching ID
        state.roster = state.roster.filter(r => r.id !== action.payload);
      })
      .addCase(removeFromRoster.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default teamSlice.reducer;
