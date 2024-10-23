import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPlayer, addRanking, addReview, getReviews, getPlayers } from './api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [maxRank, setMaxRank] = useState(20); // default max rank

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPlayer(id);
        setPlayer(data);
        const playersData = await getPlayers();
        setMaxRank(playersData.length);
      } catch (error) {
        console.error("Failed to fetch player data:", error);
        setError("Failed to fetch player data.");
      }
    }
    fetchData();
  }, [id]);

  const handleRankingSubmit = async (values, { resetForm }) => {
    try {
      await addRanking({ ...values, player_id: id });
      setSuccess('Ranking added successfully!');
      resetForm();
    } catch (error) {
      console.error("Failed to add ranking:", error);
      setError("Failed to add ranking.");
    }
  };

  const handleReviewSubmit = async (values, { resetForm }) => {
    try {
      await addReview({ ...values, player_id: id });
      setSuccess('Review added successfully!');
      resetForm();
    } catch (error) {
      console.error("Failed to add review:", error);
      setError("Failed to add review.");
    }
  };

  const handleToggleReviews = async () => {
    if (!showReviews) {
      try {
        const data = await getReviews();
        const playerReviews = data.filter(review => review.player_id === parseInt(id));
        setReviews(playerReviews);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setError("Failed to fetch reviews.");
      }
    }
    setShowReviews(!showReviews);
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!player) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>{player.name}'s Details</h1>
      <p>ID: {player.id}</p>
      <p>Position: {player.position}</p>
      <p>Team: {player.team}</p>
      <p>Stats: {JSON.stringify(player.stats)}</p>
      <p>Average Rank: {player.average_rank !== null ? player.average_rank.toFixed(2) : 'N/A'}</p>

      <h2>Add a Rank</h2>
      {success && <p className="success-message">{success}</p>}
      <Formik
        initialValues={{ rank: '', user_id: '' }}
        validationSchema={Yup.object({
          rank: Yup.number().min(1, 'Rank must be at least 1').max(maxRank, `Rank must be at most ${maxRank}`).required('Required'),
          user_id: Yup.number().required('Required')
        })}
        onSubmit={handleRankingSubmit}
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
          <button type="submit">Add Rank</button>
        </Form>
      </Formik>

      <h2>Add a Review</h2>
      {success && <p className="success-message">{success}</p>}
      <Formik
        initialValues={{ content: '', user_id: '' }}
        validationSchema={Yup.object({
          content: Yup.string().required('Required'),
          user_id: Yup.number().required('Required')
        })}
        onSubmit={handleReviewSubmit}
      >
        <Form>
          <div>
            <label htmlFor="content">Review</label>
            <Field as="textarea" id="content" name="content" />
            <ErrorMessage name="content" component="div" />
          </div>
          <div>
            <label htmlFor="user_id">User ID</label>
            <Field type="number" id="user_id" name="user_id" />
            <ErrorMessage name="user_id" component="div" />
          </div>
          <button type="submit">Add Review</button>
        </Form>
      </Formik>

      <button className="toggle-reviews-button" onClick={handleToggleReviews}>
        {showReviews ? 'Hide Reviews' : 'Show Reviews'}
      </button>

      {showReviews && (
        <div>
          <h2>Reviews</h2>
          <ul>
            {reviews.map(review => (
              <li key={review.id}>{review.content} (User ID: {review.user_id})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;
