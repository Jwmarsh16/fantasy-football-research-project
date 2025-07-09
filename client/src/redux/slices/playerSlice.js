// src/redux/slices/playerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch all players
export const fetchPlayers = createAsyncThunk(
  'player/fetchPlayers',
  async () => {
    const response = await axios.get('/api/players');
    return response.data;
  }
);

// Async thunk to fetch a single player's full details
export const fetchPlayer = createAsyncThunk(
  'player/fetchPlayer',
  async (playerId) => {
    const response = await axios.get(`/api/players/${playerId}`);
    return response.data;
  }
);

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    players: [],
    status: 'idle',            // for fetchPlayers
    playerStatus: 'idle',      // for fetchPlayer
    error: null,               // to capture errors
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
      // fetchPlayers lifecycle
      .addCase(fetchPlayers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.players = action.payload;
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // fetchPlayer lifecycle
      .addCase(fetchPlayer.pending, (state) => {
        state.playerStatus = 'loading';
      })
      .addCase(fetchPlayer.fulfilled, (state, action) => {
        state.playerStatus = 'succeeded';
        state.currentPlayer = action.payload;
      })
      .addCase(fetchPlayer.rejected, (state, action) => {
        state.playerStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setMaxRank, setPlayer, setReviews } = playerSlice.actions;
export default playerSlice.reducer;
