// store.js - Setting up Redux store using Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './redux/slices/playerSlice';
import userReducer from './redux/slices/userSlice';
import reviewReducer from './redux/slices/reviewSlice';
import authReducer from './redux/slices/authSlice';
import groupReducer from './redux/slices/groupSlice';

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