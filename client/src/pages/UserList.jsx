import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../redux/slices/userSlice';
import { Link } from 'react-router-dom';
import '../style/UserListStyle.css';

function UserList() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users);
  const status = useSelector((state) => state.user.status);
  const [searchUsername, setSearchUsername] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const S3_BUCKET_URL = "https://fantasy-football-research-hub.s3.amazonaws.com/";

  // ✅ Debugging: Log fetched users to check profilePic values
  useEffect(() => {
    console.log("UserList.jsx - Fetched users:", users);
  }, [users]);

  // Always fetch users on component mount.
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (searchUsername) {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(searchUsername.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchUsername, users]);

  if (status === 'loading') {
    return <div className="loading-message">Loading users...</div>;
  }

  if (status === 'failed') {
    return <div className="error-message">Error loading users.</div>;
  }

  return (
    <div className="user-list-page container">
      <h1 className="page-title">User List</h1>
      <form className="search-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          className="search-input"
          placeholder="Search by username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
        />
      </form>
      {filteredUsers && filteredUsers.length > 0 ? (
        <div className="user-list-grid">
          {filteredUsers.map((user) => {
            // ✅ Debugging: Log profilePic values for each user
            console.log(`UserList.jsx - Processing user: ${user.username}, profilePic: ${user.profilePic}, isFake: ${user.isFake}`);

            // ✅ Ensure avatar displays correctly based on database values
            const avatarUrl =
              user.profilePic && user.profilePic.trim() !== "" && user.profilePic !== "avatar"
                ? user.profilePic // ✅ Use the full pre-signed URL from Flask
                : user.isFake && user.profilePic === "avatar"
                ? `https://i.pravatar.cc/150?u=${user.id}` // ✅ Fake user avatar
                : "https://placehold.co/600x400?text=Upload+Picture"; // ✅ Default placeholder

            // ✅ Debugging: Log generated avatar URLs
            console.log(`UserList.jsx - User: ${user.username}, Avatar URL: ${avatarUrl}`);

            return (
              <div key={user.id} className="user-card">
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
          })}
        </div>
      ) : (
        <p className="no-users-message">No users found.</p>
      )}
    </div>
  );
}

export default UserList;
