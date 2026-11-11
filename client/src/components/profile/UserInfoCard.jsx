// components/profile/UserInfoCard.jsx
import '../../style/UserInfoCard.css';
import ProfilePicUpdater from '../user/ProfilePicUpdater';
import UserAvatar from '../user/UserAvatar';

function UserInfoCard({ avatarUrl, forceUpdate, userDetails, currentUser, parsedUserId, dispatch, fetchUsers, setUserDetails }) {
  const { username, email } = userDetails;
  const emailText = String(email ?? '');
  const domainStart = emailText.lastIndexOf('@');

  return (
    <>
      <UserAvatar key={forceUpdate} username={username} src={avatarUrl} />
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
