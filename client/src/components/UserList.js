import React, { useState, useEffect } from 'react';
import { getUsers, getUserById } from './api';
import { Link } from 'react-router-dom';

function UserList() {
  const [users, setUsers] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [filteredUser, setFilteredUser] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      const data = await getUsers();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (searchId) {
      const user = await getUserById(searchId);
      setFilteredUser(user);
    } else {
      setFilteredUser(null);
    }
  };

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
