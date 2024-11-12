// NavBar.jsx - Updated to use Redux for conditional rendering based on authentication status
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../redux/slices/authSlice';

function NavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();  // Using unwrap to handle errors directly
      navigate('/'); // Redirect to home after logging out
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Fantasy Football Hub
      </Link>
      <ul className="navbar-links navbar-links-center">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/players">Players</Link></li>
        <li><Link to="/users">Users</Link></li>
        {!user ? (
          <>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        ) : (
          <li><Link to={`/profile/${user.id}`}>Profile</Link></li> 
        )}
      </ul>
      {user && (
        <button className="navbar-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}
    </nav>
  );
}

export default NavBar;
