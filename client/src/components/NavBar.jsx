// NavBar.jsx - Updated to use Redux for conditional rendering based on authentication status with appropriate class names for styling
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function NavBar() {
  const user = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

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
          <li><Link to="/profile">Profile</Link></li>
        )}
      </ul>
      {user && (
        <button className="navbar-button logout-button">
        Logout
        </button>
      
      )}
    </nav>
  );
}

export default NavBar;