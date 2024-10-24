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
    return <div>Loading users...</div>;
  }

  if (status === 'failed') {
    return <div>Error loading users.</div>;
  }

  return (
    <div className="container">
      <h1>User List</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by user ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {filteredUser ? (
        <div>
          <h2>Search Result</h2>
          <p>{filteredUser.username} (ID: {filteredUser.id})</p>
          <Link to={`/profile/${filteredUser.id}`}>View Profile</Link>
        </div>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} (ID: {user.id}) - <Link to={`/profile/${user.id}`}>View Profile</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;
