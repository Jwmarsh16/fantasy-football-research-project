// UserList.jsx - Updated to use Redux and Axios for fetching the list of users
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../redux/slices/userSlice';
import { Link } from 'react-router-dom';

function UserList() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users);
  const status = useSelector((state) => state.user.status);
  const [searchUsername, setSearchUsername] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch users whenever the component mounts
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  // Update filtered users based on the search term
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

  // Handle loading state
  if (status === 'loading') {
    return <div className="loading-message">Loading users...</div>;
  }

  // Handle error state
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
        <ul className="user-list">
          {filteredUsers.map((user) => (
            <li key={user.id} className="user-list-item">
              <div className="user-card">
                <p className="user-info">
                  <span className="user-username">{user.username}</span> (ID: {user.id})
                </p>
                <Link to={`/profile/${user.id}`} className="view-profile-link">View Profile</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-users-message">No users found.</p>
      )}
    </div>
  );
}

export default UserList;
