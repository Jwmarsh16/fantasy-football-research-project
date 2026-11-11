import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

function UserCard({ user }) {
  const photo = user.profilePic?.trim();
  const avatarUrl = photo === 'avatar'
    ? user.isFake && `https://i.pravatar.cc/150?u=${user.id}`
    : photo;

  return (
    <div className="user-card">
      <UserAvatar username={user.username} src={avatarUrl} className="user-card__avatar" />
      <div className="user-card__info">
        <span className="user-card__username">{user.username}</span>
        <Link
          to={`/profile/${user.id}`}
          className="ffrh-button ffrh-button--secondary"
          aria-label={`View profile for ${user.username}`}
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default UserCard;
