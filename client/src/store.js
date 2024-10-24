// store.js - Setting up Redux store using Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './slices/playerSlice';
import userReducer from './slices/userSlice';
import reviewReducer from './slices/reviewSlice';
import authReducer from './slices/authSlice';
import groupReducer from './slices/groupSlice';

const store = configureStore({
  reducer: {
    player: playerReducer,
    user: userReducer,
    review: reviewReducer,
    auth: authReducer,
    group: groupReducer,
  },
});

export default store;