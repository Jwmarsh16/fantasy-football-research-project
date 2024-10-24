// NavBar.jsx - Updated to use Redux for conditional rendering based on authentication status
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function NavBar() {
  const user = useSelector((state) => state.auth.currentUser);

  return (
    <nav>
      <ul>
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
    </nav>
  );
}

export default NavBar;
