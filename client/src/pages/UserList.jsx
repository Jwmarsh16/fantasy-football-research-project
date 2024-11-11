// UserList.jsx - Updated to use Redux and Axios for fetching the list of users
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUsers, fetchUsers, setFilteredUser } from '../redux/slices/userSlice';
import { Link } from 'react-router-dom';

function UserList() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users);
  const filteredUser = useSelector((state) => state.user.filteredUser);
  const status = useSelector((state) => state.user.status);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (searchId) {
      try {
        const response = await axios.get(`/api/users/${searchId}`);
        dispatch(setFilteredUser(response.data));
      } catch (error) {
        console.error('Error fetching user by ID:', error);
      }
    } else {
      dispatch(setFilteredUser(null));
    }
  };

  if (status === 'loading') {
    return <div className="loading-message">Loading users...</div>;
  }

  if (status === 'failed') {
    return <div className="error-message">Error loading users.</div>;
  }

  return (
    <div className="user-list-page container">
      <h1 className="page-title">User List</h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Search by user ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      {filteredUser ? (
        <div className="search-result">
          <h2 className="section-title">Search Result</h2>
          <div className="user-card">
            <p className="user-info">
              <span className="user-username">{filteredUser.username}</span> (ID: {filteredUser.id})
            </p>
            <Link to={`/profile/${filteredUser.id}`} className="view-profile-link">View Profile</Link>
          </div>
        </div>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
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
      )}
    </div>
  );
}

export default UserList;
