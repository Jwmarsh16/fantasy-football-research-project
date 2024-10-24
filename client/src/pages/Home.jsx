// Home.jsx - Updated to use Redux for checking user authentication status and Axios for fetching data if necessary
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUserDetails } from '../redux/slices/userSlice';

function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.currentUser);
  const userDetails = useSelector((state) => state.user.details);

  useEffect(() => {
    if (user && !userDetails) {
      axios.get(`/api/users/${user.id}`)
        .then((response) => {
          dispatch(setUserDetails(response.data));
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [user, userDetails, dispatch]);

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome back to your Fantasy Football Portal!</h1>
      {user ? (
        <div className="user-info">
          <p className="user-greeting">Logged in as: <span className="user-name">{user.name}</span></p>
          {userDetails && <p className="user-details">Details: <span className="user-email">{userDetails.email}</span></p>}
        </div>
      ) : (
        <div className="auth-prompt">
          <p className="login-message">Please login or register to continue your journey.</p>
          <button className="auth-button">Login/Register</button>
        </div>
      )}
    </div>
  );
}

export default Home;