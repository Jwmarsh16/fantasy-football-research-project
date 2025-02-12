// slices/reviewSlice.js - Creating review slice with async thunk for API requests
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch reviews data
export const fetchReviews = createAsyncThunk('review/fetchReviews', async () => {
  const response = await axios.get('/api/reviews', { withCredentials: true });
  return response.data;
});

// Async thunk to add a new review
export const addReview = createAsyncThunk('review/addReview', async (review) => {
  const response = await axios.post('/api/reviews', review, { withCredentials: true });
  return response.data;
});

// Async thunk to delete a review
export const deleteReview = createAsyncThunk('review/deleteReview', async (reviewId) => {
  await axios.delete(`/api/reviews/${reviewId}`, { withCredentials: true });
  return reviewId;
});

// NEW: Async thunk to update a review
// Expects an object that contains the review "id" and the updated review data.
export const updateReview = createAsyncThunk(
  'review/updateReview',
  async (updatedReview) => {
    const response = await axios.put(
      `/api/reviews/${updatedReview.id}`,
      updatedReview,
      { withCredentials: true }
    );
    return response.data;
  }
);

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
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((review) => review.id !== action.payload);
      })
      // NEW: Handle review update
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex((review) => review.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      });
  },
});

export default reviewSlice.reducer;
