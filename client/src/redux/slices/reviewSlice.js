// slices/reviewSlice.js - Creating review slice with async thunk for API requests
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch reviews data
export const fetchReviews = createAsyncThunk('review/fetchReviews', async () => {
  const response = await axios.get('/api/reviews');
  return response.data;
});

// Async thunk to add a new review
export const addReview = createAsyncThunk('review/addReview', async (review) => {
  const response = await axios.post('/api/reviews', review);
  return response.data;
});

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    reviews: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
      });
  },
});

export default reviewSlice.reducer;