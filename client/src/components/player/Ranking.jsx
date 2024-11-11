// Ranking.jsx - Updated to use Redux and Axios for managing rankings
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setMaxRank } from '../../slices/playerSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function Ranking() {
  const dispatch = useDispatch();
  const maxRank = useSelector((state) => state.player.maxRank);
  const users = useSelector((state) => state.user.users);
  const userStatus = useSelector((state) => state.user.status);

  useEffect(() => {
    async function fetchData() {
      try {
        const playersData = await axios.get('/api/players');
        dispatch(setMaxRank(playersData.data.length));
        
        if (userStatus === 'idle') {
          dispatch(fetchUsers());
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    fetchData();
  }, [dispatch, userStatus]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={createValidationSchema()}
      onSubmit={onSubmit}
    >
      <Form>
        <div>
          <label htmlFor="rank">Rank</label>
          <Field type="number" id="rank" name="rank" />
          <ErrorMessage name="rank" component="div" />
        </div>
        <div>
          <label htmlFor="user_id">User</label>
          <Field as="select" name="user_id">
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </Field>
          <ErrorMessage name="user_id" component="div" />
        </div>
        <div>
          <label htmlFor="player_id">Player ID</label>
          <Field type="number" id="player_id" name="player_id" />
          <ErrorMessage name="player_id" component="div" />
        </div>
        <button type="submit">Submit Ranking</button>
      </Form>
    </Formik>
  );
}

export default Ranking;
