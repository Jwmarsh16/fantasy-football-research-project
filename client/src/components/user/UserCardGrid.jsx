import React from 'react';
import { Link } from 'react-router-dom';
import UserCard from './UserCard';

function UserCardGrid({ users }) {
  if (!users || users.length === 0) {
    return <p className="no-users-message">No users found.</p>;
  }

  return (
    <div className="user-list-grid">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

export default UserCardGrid;
