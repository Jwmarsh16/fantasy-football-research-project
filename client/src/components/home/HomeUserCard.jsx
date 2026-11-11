import '../../style/HomeUserCard.css';

function UserCard({ avatarUrl, username = 'Loading...', email = 'Unknown Email' }) {
  return (
    <div className="home-user-card">
      {avatarUrl ? (
        <img className="home-user-avatar" src={avatarUrl} alt="" />
      ) : (
        <span className="home-user-avatar" aria-hidden="true">{username?.charAt(0).toUpperCase() || 'U'}</span>
      )}
      <div>
        <p className="home-user-name">{username}</p>
        <p className="home-user-email">{email}</p>
      </div>
    </div>
  );
}

export default UserCard;
