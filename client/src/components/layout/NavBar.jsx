// src/components/layout/NavBar.jsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';    /* Switched to NavLink */
import { logoutUser } from '../../redux/slices/authSlice';
import '../../style/NavBarStyle.css';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setMenuOpen(false);
      navigate('/'); // Redirect to home after logging out
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container"> {/* Wrap for centered max-width container */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          Fantasy Football Hub
        </Link>

        <button
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        <ul id="primary-navigation" className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/players"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Players
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/users"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Users
            </NavLink>
          </li>
          {!user ? (
            <>
              <li>
                <NavLink
                  to="/register"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                >
                  Register
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                >
                  Login
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <NavLink
                to={`/profile/${user.id}`}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                Profile
              </NavLink>
            </li>
          )}
        </ul>

        {user && (
          <button
            className="navbar-button logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
