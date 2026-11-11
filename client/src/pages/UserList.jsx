import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../redux/slices/userSlice';
import '../style/UserListStyle.css';

import UserSearchForm from '../components/user/UserSearchForm';
import UserCardGrid from '../components/user/UserCardGrid';

function UserList() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users);
  const status = useSelector((state) => state.user.status);

  const [searchUsername, setSearchUsername] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const filtered = searchUsername
      ? users.filter((user) =>
          user.username.toLowerCase().includes(searchUsername.toLowerCase())
        )
      : users;
    setFilteredUsers(filtered);
  }, [searchUsername, users]);

  if (status === 'loading') return <div className="loading-message">Loading users...</div>;
  if (status === 'failed') return <div className="error-message">Error loading users.</div>;

  return (
    <main className="user-list-page container">
      <h1 className="user-list-title">Users</h1>
      <UserSearchForm searchUsername={searchUsername} setSearchUsername={setSearchUsername} />
      <UserCardGrid users={filteredUsers} />
    </main>
  );
}

export default UserList;
