// src/components/home/UserCard.jsx
import React from 'react';
import '../../style/UserCard.css';

const UserCard = ({ avatarUrl, username, email }) => {
  return (
    <div className="user-info-container">
      <div className="user-info-card">
        <div className="user-avatar">
          <img src={avatarUrl} alt="User Avatar" />
        </div>
        <div className="user-info-text">
          <p className="user-name">{username || "Loading..."}</p>
          <p className="user-email">{email || "Unknown Email"}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
