// Home.jsx - Updated to use Redux for checking user authentication status and Axios for fetching data if necessary
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUserDetails } from '../slices/userSlice';

function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.currentUser);
  const userDetails = useSelector((state) => state.user.details);

  useEffect(() => {
    if (user && !userDetails) {
      axios.get(`/api/users/${user.id}`)
        .then((response) => {
          dispatch(setUserDetails(response.data));
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [user, userDetails, dispatch]);

  return (
    <div>
      <h1>Welcome back to your Fantasy Football Portal!</h1>
      {user ? (
        <div>
          <p>Logged in as: {user.name}</p>
          {userDetails && <p>Details: {userDetails.email}</p>}
        </div>
      ) : (
        <p>Please login or register to continue your journey.</p>
      )}
    </div>
  );
}

export default Home;
