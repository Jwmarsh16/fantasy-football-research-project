// src/components/home/UserCard.jsx
import React from 'react';
import '../../style/HomeUserCard.css';

function UserCard({
  avatarUrl,
  username = "Loading...",    /* Default if username is undefined */
  email = "Unknown Email"     /* Default if email is undefined */
}) {
  return (
    <div className="user-info-container">
      <div className="user-info-card">
        <div className="user-avatar">
          <img
            src={avatarUrl}
            alt={`Avatar of ${username}`}   /* Improved alt for accessibility */
          />
        </div>
        <div className="user-info-text">
          <p className="user-name">{username}</p>
          <p className="user-email">{email}</p>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
