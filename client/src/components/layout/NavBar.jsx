// src/components/layout/NavBar.jsx
import { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import '../../style/NavBarStyle.css';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const user = useSelector((state) => state.auth.currentUser);
  const profilePath = user ? `/profile/${user.id}` : null;
  const onOwnProfile = Boolean(user) && (pathname === profilePath || pathname === '/profile');
  const onRankings = onOwnProfile && new URLSearchParams(search).get('tab') === 'rankings';

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const handleMenuKeyDown = (event) => {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu();
      menuToggle.current?.focus();
    }
  };

  return (
    <nav className="navbar" aria-label="Primary" onKeyDown={handleMenuKeyDown}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          Fantasy Football Hub
        </Link>

        <button
          ref={menuToggle}
          type="button"
          className="hamburger"
          onClick={() => setMenuOpen(open => !open)}
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
            <>
              <li>
                <Link
                  to={profilePath}
                  onClick={closeMenu}
                  className="nav-link"
                  aria-current={onOwnProfile && !onRankings ? 'page' : undefined}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to={`${profilePath}?tab=rankings`}
                  onClick={closeMenu}
                  className="nav-link"
                  aria-current={onRankings ? 'page' : undefined}
                >
                  My Rankings
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="ffrh-button ffrh-button--secondary navbar-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
