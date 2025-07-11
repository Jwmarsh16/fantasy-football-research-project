// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/slices/authSlice';
import userReducer from './redux/slices/userSlice';
import playerReducer from './redux/slices/playerSlice';
import rankingReducer from './redux/slices/rankingSlice';
import reviewReducer from './redux/slices/reviewSlice';
import teamReducer from './redux/slices/teamSlice'; // added team reducer

export default configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    player: playerReducer,
    ranking: rankingReducer,
    review: reviewReducer,
    team: teamReducer          // register team slice here
  }
});
