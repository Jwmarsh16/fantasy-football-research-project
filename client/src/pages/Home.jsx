// Home.jsx - Ensure user data is properly fetched and displayed after login
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserById } from '../redux/slices/userSlice';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const authStatus = useSelector((state) => state.auth.status);
  const userDetails = useSelector((state) => state.user.userDetails);
  const userLoadingStatus = useSelector((state) => state.user.status);

  useEffect(() => {
    if (isAuthenticated && !userDetails && user && user.id) {
      dispatch(fetchUserById(user.id));  // Use the async thunk to fetch user details
    }
  }, [isAuthenticated, userDetails, user, dispatch]);

  const handleAuthButtonClick = () => {
    navigate('/register');
  };

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome back to your Fantasy Football Portal!</h1>
      {userLoadingStatus === 'loading' ? (
        <p>Loading user information...</p>
      ) : isAuthenticated && user ? (
        <div className="user-info">
          <p className="user-greeting">
            Logged in as: <span className="user-name">{user?.username || 'Loading...'}</span>
          </p>
          {userDetails ? (
            <p className="user-details">
              Details: <span className="user-email">{userDetails.email || 'Unknown Email'}</span>
            </p>
          ) : (
            <p>Loading additional user details...</p>
          )}
        </div>
      ) : (
        <div className="auth-prompt">
          <p className="login-message">Please login or register to continue your journey.</p>
          <button className="auth-button" onClick={handleAuthButtonClick}>Register</button>
        </div>
      )}
    </div>
  );
}

export default Home;
