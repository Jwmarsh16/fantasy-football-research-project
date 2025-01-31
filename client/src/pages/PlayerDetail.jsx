import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setPlayer, setReviews, setMaxRank } from '../redux/slices/playerSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import { addRanking, fetchRankings } from '../redux/slices/rankingSlice';
import { addReview, fetchReviews } from '../redux/slices/reviewSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../style/PlayerDetailStyle.css';

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
      await dispatch(
        addRanking({
          rank: values.rank,
          player_id: parseInt(id),
          user_id: currentUser.id,
        })
      ).unwrap();

      await dispatch(
        addReview({
          content: values.content,
          player_id: parseInt(id),
          user_id: currentUser.id,
        })
      ).unwrap();

      setSuccess('Ranking and review added successfully!');
      resetForm();

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
        dispatch(fetchRankings());
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
  if (!player) return <div className="loading-message">Loading...</div>;

  return (
    <div className="player-detail-container">
    <div className="player-info-card">
      {/* Player Avatar */}
      <div className="player-avatar">
        <img 
          src={`https://i.pravatar.cc/150?u=${player.id}`} 
          alt={`${player.name}'s Avatar`} 
          className="player-avatar-img" 
        />
      </div>
      <h1 className="player-name">{player.name}</h1>
      <div className="player-details">
        <p><strong>Position:</strong> {player.position}</p>
        <p><strong>Team:</strong> {player.team}</p>
        <div className="player-stats">
          <h3 className="stats-title">Stats</h3>
          <table className="stats-table">
            <thead>
              <tr>
                {Object.keys(player.stats || {}).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(player.stats || {}).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>Average Rank:</strong> {player.average_rank !== null ? player.average_rank.toFixed(2) : 'N/A'}</p>
      </div>
    </div>
  
    <div className="ranking-review-form">
      <h2 className="form-title">Add a Rank and Review</h2>
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
          <Form className="player-review-form">
            <div className="form-group">
              <label htmlFor="rank">Rank</label>
              <Field type="number" id="rank" name="rank" className="input-field" />
              <ErrorMessage name="rank" component="div" className="error-message" />
            </div>
            <div className="form-group">
              <label htmlFor="content">Review</label>
              <Field as="textarea" id="content" name="content" className="input-field" />
              <ErrorMessage name="content" component="div" className="error-message" />
            </div>
            <button type="submit" className="submit-button">Add Rank and Review</button>
          </Form>
        </Formik>
      )}
    </div>
  
    <button className="toggle-reviews-button" onClick={handleToggleReviews}>
      {showReviews ? 'Hide Reviews' : 'Show Reviews'}
    </button>
  
    {showReviews && (
      <div className="reviews-section">
        <h2 className="reviews-title">Reviews</h2>
        <ul className="reviews-list">
          {combinedReviewsAndRankings.map((item) => (
            <li key={item.id} className="review-card">
              <p className="review-username"><strong>{getUsernameById(item.user_id)}</strong>:</p>
              <p className="review-content">{item.content}</p>
              <p className="review-rank">Ranking: {item.rank}</p>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>

  );
}

export default PlayerDetail;
