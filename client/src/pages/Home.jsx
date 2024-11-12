import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserById } from '../redux/slices/userSlice';
import '../style/HomeStyle.css';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
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
      <div className="welcome-section">
        <h1 className="home-title">Welcome back to your Fantasy Football Portal!</h1>
        <h2 className="home-subtitle">Stay on top of the stats and make your best picks!</h2>
      </div>

      {userLoadingStatus === 'loading' ? (
        <p className="loading-message">Loading user information...</p>
      ) : isAuthenticated && user ? (
        <div className="user-info-card">
          <p className="user-welcome">
            Welcome, <span className="user-name">{user?.username || 'Loading...'}</span>!
          </p>
          {userDetails ? (
            <p className="user-details">
              Email: <span className="user-email">{userDetails.email || 'Unknown Email'}</span>
            </p>
          ) : (
            <p className="loading-message">Loading additional user details...</p>
          )}
        </div>
      ) : (
        <div className="auth-section">
          <p className="login-message">Please login or register to continue your journey.</p>
          <button className="auth-button" onClick={handleAuthButtonClick}>Register</button>
        </div>
      )}
    </div>
  );
}

export default Home;
