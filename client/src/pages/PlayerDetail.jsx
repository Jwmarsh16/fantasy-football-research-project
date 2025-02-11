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

// ---------------------------------------------------------------------
// Updated getPlayerHeadshot function:
// Fixed the URL string to use a proper template literal so that the player's
// headshot image is loaded correctly from the local folder.
const getPlayerHeadshot = (playerName) => {
  const formattedName = playerName.toLowerCase().replace(/ /g, "_");
  return `/images/players/${formattedName}.png`; // Corrected to use backticks for template literal
};
// ---------------------------------------------------------------------

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
  
  // ---------------------------------------------------------------------
  // NEW: State variable to track the sort order for reviews and rankings.
  // 'asc' means ascending order (i.e., Best to Worst with rank 1 first)
  // 'desc' would mean descending order (i.e., Worst to Best)
  const [sortOrder, setSortOrder] = useState('asc');
  // ---------------------------------------------------------------------

  // Helper function to format stat keys (e.g., "games_played" => "Games Played")
  const formatStatKey = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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

  // ---------------------------------------------------------------------
  // Combine reviews and corresponding rankings for this player.
  // Updated here:
  // - We now use null for missing rankings (instead of 'N/A') so that numeric sorting works correctly.
  const combinedReviewsAndRankings = reviews
    .filter((review) => review.player_id === parseInt(id))
    .map((review) => {
      const rankingObj = rankings.find(
        (ranking) =>
          ranking.player_id === review.player_id &&
          ranking.user_id === review.user_id
      );
      return {
        ...review,
        rank: rankingObj ? rankingObj.rank : null, // null indicates no ranking available
      };
    });
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // NEW: Sort the combined reviews and rankings based on the selected sort order.
  // Reviews with no ranking (null) are treated as having a rank of Infinity so that
  // they appear at the end of the sorted list.
  const sortedReviews = [...combinedReviewsAndRankings].sort((a, b) => {
    const aRank = a.rank !== null ? a.rank : Infinity;
    const bRank = b.rank !== null ? b.rank : Infinity;
    return sortOrder === 'asc' ? aRank - bRank : bRank - aRank;
  });
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // UPDATED: Update handleCombinedSubmit to re-fetch player details after submission.
  // This ensures the average rank is updated and rendered immediately.
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

      // NEW: Re-fetch the updated player details to update the average rank immediately.
      const updatedPlayerResponse = await axios.get(`/api/players/${id}`);
      dispatch(setPlayer(updatedPlayerResponse.data));
    } catch (error) {
      console.error('Failed to add ranking and review:', error);
      setError('Failed to add ranking and review.');
    }
  };
  // ---------------------------------------------------------------------

  const handleToggleReviews = async () => {
    if (!showReviews) {
      try {
        const response = await axios.get('/api/reviews');
        // Filter for this player's reviews only
        const playerReviews = response.data.filter(
          (review) => review.player_id === parseInt(id)
        );
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

  if (error) return <div className="error-message">{error}</div>;
  if (!player) return <div className="loading-message">Loading...</div>;

  return (
    <div className="player-detail-container">
      <div className="player-info-card">
        {/* Player Avatar */}
        <div className="player-avatar">
          <img 
            src={getPlayerHeadshot(player.name)}
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/150"; 
            }} 
            alt={`${player.name}'s Headshot`} 
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
                    <th key={key}>{formatStatKey(key)}</th>
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
          <p>
            <strong>Average Rank:</strong>{' '}
            {player.average_rank !== null ? player.average_rank.toFixed(2) : 'N/A'}
          </p>
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

      {/* Show Reviews and Rankings Button */}
      <div className="toggle-reviews-section">
        <button className="toggle-button" onClick={handleToggleReviews}>
          {showReviews ? 'Hide Reviews and Rankings' : 'Show Reviews and Rankings'}
        </button>
      </div>

      {/* Conditionally render the reviews and rankings */}
      {showReviews && (
        <div className="reviews-rankings-display">
          <h3 className="section-title">Reviews and Rankings</h3>
          {/* ---------------------------------------------------------------------
              NEW: Dropdown for selecting sort order.
              This allows the user to sort reviews from Best to Worst (ascending)
              or Worst to Best (descending) based on the ranking.
          --------------------------------------------------------------------- */}
          <div className="sort-options">
            <label htmlFor="sortOrder">Sort by Ranking: </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Best to Worst</option>
              <option value="desc">Worst to Best</option>
            </select>
          </div>
          {sortedReviews && sortedReviews.length > 0 ? (
            sortedReviews.map((item, index) => (
              <div key={index} className="review-ranking-item">
                <div className="review-header">
                  <p className="review-player">
                    <span className="review-username">{getUsernameById(item.user_id)}</span>
                    {/* ---------------------------------------------------------------------
                        Updated the display so that if the rank is missing (null),
                        it shows 'N/A' instead of a blank value.
                    --------------------------------------------------------------------- */}
                    <span className="review-ranking"> - Rank: {item.rank !== null ? item.rank : 'N/A'}</span>
                  </p>
                </div>
                <p className="review-content">{item.content}</p>
              </div>
            ))
          ) : (
            <p className="no-reviews-message">No reviews or rankings available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;
