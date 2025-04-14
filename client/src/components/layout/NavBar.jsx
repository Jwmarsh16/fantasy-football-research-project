import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import '../../style/NavBarStyle.css';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/'); // Redirect to home after logging out
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        Fantasy Football Hub
      </Link>
      <button className="hamburger" onClick={toggleMenu} aria-label="Toggle navigation">
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
      </button>
      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/players" onClick={closeMenu}>Players</Link></li>
        <li><Link to="/users" onClick={closeMenu}>Users</Link></li>
        {!user ? (
          <>
            <li><Link to="/register" onClick={closeMenu}>Register</Link></li>
            <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
          </>
        ) : (
          <li><Link to={`/profile/${user.id}`} onClick={closeMenu}>Profile</Link></li>
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
