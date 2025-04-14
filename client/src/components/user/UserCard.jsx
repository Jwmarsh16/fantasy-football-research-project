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
      <div className="user-avatar">
        <img src={avatarUrl} alt={`${user.username}'s Avatar`} />
      </div>
      <div className="user-info">
        <span className="user-username">{user.username}</span>
        <Link to={`/profile/${user.id}`} className="view-profile-link">
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default UserCard;
