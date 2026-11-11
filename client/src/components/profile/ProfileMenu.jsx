// components/profile/ProfileMenu.jsx
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../style/ProfileMenu.css';

const settingsLinks = [
  ['/profile/edit', 'Edit Profile'],
  ['/profile/account', 'Account Settings'],
  ['/profile/privacy', 'Privacy Settings'],
  ['/profile/security', 'Security Settings'],
  ['/profile/notifications', 'Notification Settings'],
  ['/profile/language', 'Language & Accessibility Options'],
  ['/profile/content', 'Content & Ad Preferences'],
  ['/profile/data', 'Data & Privacy Tools'],
];

function ProfileMenu({ currentUser, parsedUserId, showMenu, setShowMenu, handleDeleteProfile }) {
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowMenu]);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && showMenu) {
      setShowMenu(false);
      toggleRef.current?.focus();
    }
  };

  if (!currentUser || parsedUserId !== currentUser.id) return null;

  return (
    <div className="profile-menu-container" ref={menuRef} onKeyDown={handleKeyDown}>
      <button
        ref={toggleRef}
        type="button"
        className="profile-menu-toggle"
        onClick={toggleMenu}
        aria-label="Profile options"
        aria-controls="profile-options"
        aria-expanded={showMenu}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      <ul className="profile-menu" id="profile-options" hidden={!showMenu}>
        {settingsLinks.map(([path, label]) => (
          <li key={path}><Link to={path} onClick={() => setShowMenu(false)}>{label}</Link></li>
        ))}
        <li>
          <button className="ffrh-button ffrh-button--danger" type="button" onClick={handleDeleteProfile}>
            Delete Profile
          </button>
        </li>
      </ul>
    </div>
  );
}

export default ProfileMenu;
