// playerSlice.js - Updated with setMaxRank and improved state handling
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch players data
export const fetchPlayers = createAsyncThunk('player/fetchPlayers', async () => {
  const response = await axios.get('/api/players');
  return response.data;
});

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    players: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    maxRank: 20,
    currentPlayer: null,
    reviews: [],
  },
  reducers: {
    setMaxRank: (state, action) => {
      state.maxRank = action.payload;
    },
    setPlayer: (state, action) => {
      state.currentPlayer = action.payload;
    },
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.players = action.payload;
      })
      .addCase(fetchPlayers.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { setMaxRank, setPlayer, setReviews } = playerSlice.actions;
export default playerSlice.reducer;
