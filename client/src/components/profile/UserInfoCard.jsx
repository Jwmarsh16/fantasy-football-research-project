// components/profile/UserInfoCard.jsx
import { useState } from 'react';
import '../../style/UserInfoCard.css';
import ProfilePicUpdater from '../user/ProfilePicUpdater';

function UserInfoCard({ avatarUrl, forceUpdate, userDetails, currentUser, parsedUserId, dispatch, fetchUsers, setUserDetails }) {
  const [failedAvatar, setFailedAvatar] = useState(null);
  const { username, email } = userDetails;
  const emailText = String(email ?? '');
  const domainStart = emailText.lastIndexOf('@');
  const avatarKey = `${forceUpdate}:${avatarUrl}`;
  const initials = String(username ?? '').trim().split(/\s+/).slice(0, 2)
    .map(word => word[0]).join('').toUpperCase();

  return (
    <>
      <div className="user-avatar-section">
        {avatarUrl && failedAvatar !== avatarKey ? (
          <img
            src={avatarUrl}
            alt=""
            className="user-avatar-img"
            key={avatarKey}
            onError={() => setFailedAvatar(avatarKey)}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      <div className="user-info-section">
        <p className="user-info-name">{username}</p>
        {emailText && (
          <p className="user-info-email">
            {domainStart > 0 ? (
              <>{emailText.slice(0, domainStart)}<wbr />{emailText.slice(domainStart)}</>
            ) : emailText}
          </p>
        )}
      </div>
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
    </>
  );
}

export default UserInfoCard;
