// rankingSlice.js - Creating ranking slice to handle rankings data
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch rankings data
export const fetchRankings = createAsyncThunk('ranking/fetchRankings', async () => {
  const response = await axios.get('/api/rankings');
  return response.data;
});

// Async thunk to delete a ranking
export const deleteRanking = createAsyncThunk('ranking/deleteRanking', async (rankingId) => {
  await axios.delete(`/api/rankings/${rankingId}`);
  return rankingId;
});

// Async thunk to add a ranking
export const addRanking = createAsyncThunk('ranking/addRanking', async (ranking) => {
  const response = await axios.post('/api/rankings', ranking);
  return response.data;
});

const rankingSlice = createSlice({
  name: 'ranking',
  initialState: {
    rankings: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRankings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRankings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rankings = action.payload;
      })
      .addCase(fetchRankings.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(deleteRanking.fulfilled, (state, action) => {
        state.rankings = state.rankings.filter((ranking) => ranking.id !== action.payload);
      })
      .addCase(addRanking.fulfilled, (state, action) => {
        state.rankings.push(action.payload);
      });
  },
});

export default rankingSlice.reducer;

