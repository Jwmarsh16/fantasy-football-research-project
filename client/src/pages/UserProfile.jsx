// UserProfile.jsx - Updated to use Axios and Redux for fetching user data
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, setCurrentUser } from '../slices/userSlice';
import { useParams } from 'react-router-dom';

function UserProfile() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users);
  const status = useSelector((state) => state.user.status);
  const { id } = useParams();
  const currentUser = users.find((user) => user.id === parseInt(id));

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers());
    } else if (currentUser) {
      dispatch(setCurrentUser(currentUser));
    }
  }, [status, dispatch, currentUser]);

  if (status === 'loading') {
    return <div>Loading user profile...</div>;
  }

  if (status === 'failed') {
    return <div>Error loading user profile.</div>;
  }

  return (
    <div>
      {currentUser ? (
        <div>
          <h2>{currentUser.name}</h2>
          <p>Email: {currentUser.email}</p>
        </div>
      ) : (
        <div>User not found.</div>
      )}
    </div>
  );
}

export default UserProfile;