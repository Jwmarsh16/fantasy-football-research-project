// components/profile/ProfileMenu.jsx
import React, { useRef, useEffect } from 'react';
import '../../style/ProfileMenu.css';

function ProfileMenu({ currentUser, parsedUserId, navigate, showMenu, setShowMenu, handleDeleteProfile }) {
  const menuRef = useRef();

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

  if (!currentUser || parsedUserId !== currentUser.id) return null;

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button className={`profile-menu-toggle ${showMenu ? 'open' : ''}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
      {showMenu && (
        <div className="profile-menu">
          <ul>
            <li onClick={() => navigate('/profile/edit')}>Edit Profile</li>
            <li onClick={() => navigate('/profile/account')}>Account Settings</li>
            <li onClick={() => navigate('/profile/privacy')}>Privacy Settings</li>
            <li onClick={() => navigate('/profile/security')}>Security Settings</li>
            <li onClick={() => navigate('/profile/notifications')}>Notification Settings</li>
            <li onClick={() => navigate('/profile/language')}>Language & Accessibility Options</li>
            <li onClick={() => navigate('/profile/content')}>Content & Ad Preferences</li>
            <li onClick={() => navigate('/profile/data')}>Data & Privacy Tools</li>
            <li onClick={handleDeleteProfile}>Delete Profile</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
