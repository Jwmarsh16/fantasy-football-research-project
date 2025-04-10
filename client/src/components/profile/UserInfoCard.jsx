// components/profile/UserInfoCard.jsx
import React from 'react';
import '../../style/UserInfoCard.css';
import ProfilePicUpdater from '../user/ProfilePicUpdater';

function UserInfoCard({ avatarUrl, forceUpdate, userDetails, currentUser, parsedUserId, dispatch, fetchUsers, setUserDetails }) {
  return (
    <div className="user-info">
      <div className="user-avatar-section">
        <img src={avatarUrl} alt={`${userDetails.username}'s Avatar`} className="user-avatar-img" key={forceUpdate} />
        {currentUser && parsedUserId === currentUser.id && (
          <ProfilePicUpdater
            userId={parsedUserId}
            onUpdate={(data) => {
              if (!data || !data.profilePic) return;
              dispatch(setUserDetails({ ...userDetails, profilePic: data.profilePic }));
              dispatch(fetchUsers());
            }}
          />
        )}
      </div>
      <div className="user-info-section">
        <p className="user-detail"><strong>Username:</strong> {userDetails.username}</p>
        <p className="user-detail"><strong>Email:</strong> {userDetails.email}</p>
      </div>
    </div>
  );
}

export default UserInfoCard;
