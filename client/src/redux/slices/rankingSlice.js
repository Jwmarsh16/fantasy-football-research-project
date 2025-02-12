// rankingSlice.js - Creating ranking slice to handle rankings data
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie to retrieve the CSRF token

// Async thunk to fetch rankings data (GET requests don't require CSRF token)
export const fetchRankings = createAsyncThunk('ranking/fetchRankings', async () => {
  const response = await axios.get('/api/rankings', { withCredentials: true });
  return response.data;
});

// Async thunk to delete a ranking (state-changing, so include CSRF token)
export const deleteRanking = createAsyncThunk('ranking/deleteRanking', async (rankingId) => {
  const csrfToken = Cookies.get('csrf_access_token');
  await axios.delete(`/api/rankings/${rankingId}`, {
    withCredentials: true,
    headers: { 'X-CSRF-TOKEN': csrfToken }
  });
  return rankingId;
});

// Async thunk to add a ranking (state-changing, so include CSRF token)
export const addRanking = createAsyncThunk('ranking/addRanking', async (ranking) => {
  const csrfToken = Cookies.get('csrf_access_token');
  const response = await axios.post('/api/rankings', ranking, {
    withCredentials: true,
    headers: { 'X-CSRF-TOKEN': csrfToken }
  });
  return response.data;
});

// Async thunk to update a ranking (state-changing, so include CSRF token)
// This thunk expects an object that includes the ranking's "id" along with the updated ranking data.
export const updateRanking = createAsyncThunk('ranking/updateRanking', async (updatedRanking) => {
  const csrfToken = Cookies.get('csrf_access_token');
  const response = await axios.put(
    `/api/rankings/${updatedRanking.id}`,
    updatedRanking,
    {
      withCredentials: true,
      headers: { 'X-CSRF-TOKEN': csrfToken }
    }
  );
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
      })
      // Update reducer case for ranking updates.
      .addCase(updateRanking.fulfilled, (state, action) => {
        const index = state.rankings.findIndex((ranking) => ranking.id === action.payload.id);
        if (index !== -1) {
          state.rankings[index] = action.payload;
        }
      });
  },
});

export default rankingSlice.reducer;
