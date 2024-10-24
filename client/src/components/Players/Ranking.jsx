// Ranking.jsx - Updated to use Redux and Axios for managing rankings
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setMaxRank } from '../slices/playerSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function Ranking() {
  const dispatch = useDispatch();
  const maxRank = useSelector((state) => state.player.maxRank);

  useEffect(() => {
    // Fetch players to determine max rank
    async function fetchPlayers() {
      try {
        const playersData = await axios.get('/api/players');
        dispatch(setMaxRank(playersData.data.length)); // Set max rank based on number of players
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    }
    fetchPlayers();
  }, [dispatch]);

  const initialValues = {
    rank: '',
    user_id: '',
    player_id: ''
  };

  // Function to create the validation schema dynamically
  const createValidationSchema = () => {
    return Yup.object({
      rank: Yup.number()
        .min(1, 'Rank must be at least 1')
        .max(maxRank, `Rank must be at most ${maxRank}`)
        .required('Required'),
      user_id: Yup.number().required('Required'),
      player_id: Yup.number().required('Required')
    });
  };

  const onSubmit = async (values) => {
    try {
      const response = await axios.post('/api/rankings', values);
      console.log(response.data);
    } catch (error) {
      console.error('Failed to submit ranking:', error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={createValidationSchema()} // Use the function to create the schema
      onSubmit={onSubmit}
    >
      <Form>
        <div>
          <label htmlFor="rank">Rank</label>
          <Field type="number" id="rank" name="rank" />
          <ErrorMessage name="rank" component="div" />
        </div>
        <div>
          <label htmlFor="user_id">User ID</label>
          <Field type="number" id="user_id" name="user_id" />
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
