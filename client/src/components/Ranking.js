import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getPlayers } from './api'; // Ensure this function is defined in your api.js

function Ranking() {
  const [maxRank, setMaxRank] = useState(20); // Default max rank, updated dynamically

  useEffect(() => {
    // Fetch players to determine max rank
    async function fetchPlayers() {
      try {
        const playersData = await getPlayers();
        setMaxRank(playersData.length); // Set max rank based on number of players
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    }

    fetchPlayers();
  }, []);

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
    const response = await fetch(`http://localhost:5555/rankings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    console.log(data);
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
