import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setPlayer, setReviews, setMaxRank } from '../../redux/slices/playerSlice';
import { fetchUsers } from '../../redux/slices/userSlice';
import { addRanking, fetchRankings } from '../../redux/slices/rankingSlice';
import { addReview, fetchReviews } from '../../redux/slices/reviewSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function PlayerDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const player = useSelector((state) => state.player.currentPlayer);
  const reviews = useSelector((state) => state.player.reviews);
  const rankings = useSelector((state) => state.ranking.rankings);
  const maxRank = useSelector((state) => state.player.maxRank);
  const users = useSelector((state) => state.user.users);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [showReviews, setShowReviews] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const playerResponse = await axios.get(`/api/players/${id}`);
        dispatch(setPlayer(playerResponse.data));
        const playersResponse = await axios.get('/api/players');
        dispatch(setMaxRank(playersResponse.data.length));
        if (!users.length) {
          dispatch(fetchUsers());
        }
      } catch (error) {
        console.error('Failed to fetch player data:', error);
        setError('Failed to fetch player data.');
      }
    }
    fetchData();
  }, [id, dispatch, users.length]);

  const handleCombinedSubmit = async (values, { resetForm }) => {
    if (!isAuthenticated || !currentUser) {
      setError('You must be logged in to add a ranking and review.');
      return;
    }

    try {
      // Dispatch addRanking to add the ranking
      await dispatch(
        addRanking({
          rank: values.rank,
          player_id: parseInt(id),
          user_id: currentUser.id,
        })
      ).unwrap();

      // Dispatch addReview to add the review
      await dispatch(
        addReview({
          content: values.content,
          player_id: parseInt(id),
          user_id: currentUser.id,
        })
      ).unwrap();

      setSuccess('Ranking and review added successfully!');
      resetForm();

      // Refresh rankings and reviews
      dispatch(fetchRankings());
      dispatch(fetchReviews());
    } catch (error) {
      console.error('Failed to add ranking and review:', error);
      setError('Failed to add ranking and review.');
    }
  };

  const handleToggleReviews = async () => {
    if (!showReviews) {
      try {
        const response = await axios.get('/api/reviews');
        const playerReviews = response.data.filter((review) => review.player_id === parseInt(id));
        dispatch(setReviews(playerReviews));
        dispatch(fetchRankings()); // Also fetch rankings to ensure latest
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setError('Failed to fetch reviews.');
      }
    }
    setShowReviews(!showReviews);
  };

  const getUsernameById = (userId) => {
    if (users.length > 0) {
      const user = users.find((user) => user.id === parseInt(userId));
      return user ? user.username : 'Unknown User';
    }
    return 'Loading...';
  };

  // Combine Reviews and Rankings Based on Player ID
  const combinedReviewsAndRankings = reviews.map((review) => {
    const ranking = rankings.find(
      (ranking) => ranking.player_id === review.player_id && ranking.user_id === review.user_id
    );
    return {
      ...review,
      rank: ranking ? ranking.rank : 'N/A',
    };
  });

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

      <h2>Add a Rank and Review</h2>
      {success && <p className="success-message">{success}</p>}
      {!isAuthenticated ? (
        <p className="error-message">Please log in to add rankings and reviews.</p>
      ) : (
        <Formik
          initialValues={{ rank: '', content: '' }}
          validationSchema={Yup.object({
            rank: Yup.number()
              .min(1, 'Rank must be at least 1')
              .max(maxRank, `Rank must be at most ${maxRank}`)
              .required('Required'),
            content: Yup.string().required('Required'),
          })}
          onSubmit={handleCombinedSubmit}
        >
          <Form>
            <div>
              <label htmlFor="rank">Rank</label>
              <Field type="number" id="rank" name="rank" />
              <ErrorMessage name="rank" component="div" />
            </div>
            <div>
              <label htmlFor="content">Review</label>
              <Field as="textarea" id="content" name="content" />
              <ErrorMessage name="content" component="div" />
            </div>
            <button type="submit">Add Rank and Review</button>
          </Form>
        </Formik>
      )}

      <button className="toggle-reviews-button" onClick={handleToggleReviews}>
        {showReviews ? 'Hide Reviews' : 'Show Reviews'}
      </button>

      {showReviews && (
        <div>
          <h2>Reviews</h2>
          <ul>
            {combinedReviewsAndRankings.map((item) => (
              <li key={item.id}>
                <strong>{getUsernameById(item.user_id)}</strong>: {item.content}
                <p>Ranking: {item.rank}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;
