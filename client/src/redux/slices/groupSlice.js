// slices/groupSlice.js - Creating group slice for managing groups
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch groups data
export const fetchGroups = createAsyncThunk('group/fetchGroups', async () => {
  const response = await axios.get('/api/groups');
  return response.data;
});

const groupSlice = createSlice({
  name: 'group',
  initialState: {
    groups: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default groupSlice.reducer;