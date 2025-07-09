// src/components/user/UserCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function UserCard({ user }) {
  const avatarUrl =
    user.profilePic && user.profilePic.trim() !== '' && user.profilePic !== 'avatar'
      ? user.profilePic
      : user.isFake && user.profilePic === 'avatar'
      ? `https://i.pravatar.cc/150?u=${user.id}`
      : 'https://placehold.co/600x400?text=Upload+Picture';

  return (
    <div className="user-card">
      {/* RENAMED: user-avatar → user-card__avatar for modularity */}
      <div className="user-card__avatar">
        <img src={avatarUrl} alt={`${user.username}'s Avatar`} />
      </div>
      {/* RENAMED: user-info → user-card__info to prevent global conflicts */}
      <div className="user-card__info">
        {/* OPTIONAL BEM: adjust if you’d like to rename user-username */}
        <span className="user-card__username">{user.username}</span>
        {/* RENAMED: view-profile-link → user-card__link for consistency */}
        <Link to={`/profile/${user.id}`} className="user-card__link">
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default UserCard;
