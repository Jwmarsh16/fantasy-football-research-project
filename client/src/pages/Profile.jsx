import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserById, setUserDetails } from '../redux/slices/userSlice';
import { fetchRankings, deleteRanking } from '../redux/slices/rankingSlice';
import { fetchReviews, deleteReview } from '../redux/slices/reviewSlice';
import axios from 'axios';

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);
  const userDetails = useSelector((state) => state.user.userDetails);
  const reviews = useSelector((state) => state.review.reviews);
  const rankings = useSelector((state) => state.ranking.rankings);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user && user.id) {
      if (!userDetails || userDetails.id !== user.id) {
        dispatch(fetchUserById(user.id))
          .unwrap()
          .then((response) => {
            if (response) {
              dispatch(setUserDetails(response));
            }
          })
          .catch((error) => {
            console.error('Error fetching user details:', error);
          });
      }
      dispatch(fetchRankings());
      dispatch(fetchReviews());
      fetchPlayers();
    }
  }, [user, userDetails, dispatch, navigate]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const getPlayerDetails = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? `${player.name}, ${player.team}, ${player.position}` : 'Unknown Player';
  };

  const handleDeleteReviewAndRanking = async (reviewId, playerId) => {
    try {
      // Delete the review
      await dispatch(deleteReview(reviewId)).unwrap();

      // Find the ranking for this player by the user
      const ranking = rankings.find(
        (ranking) => ranking.user_id === user.id && ranking.player_id === playerId
      );

      // If a ranking exists, delete it
      if (ranking) {
        await dispatch(deleteRanking(ranking.id)).unwrap();
      }
    } catch (error) {
      console.error('Failed to delete review and ranking:', error);
    }
  };

  if (!userDetails) {
    return <p className="loading-message">Loading user details...</p>;
  }

  const combinedData = reviews
    .filter((review) => review.user_id === user.id)
    .map((review) => {
      const ranking = rankings.find((ranking) => ranking.user_id === user.id && ranking.player_id === review.player_id);
      return {
        ...review,
        rank: ranking ? ranking.rank : 'N/A',
      };
    });

  return (
    <div className="profile-page">
      <h2 className="profile-title">User Profile</h2>
      <div className="user-info">
        <p className="user-detail"><strong>Username:</strong> {userDetails.username}</p>
        <p className="user-detail"><strong>Email:</strong> {userDetails.email}</p>
      </div>
      <div className="reviews-rankings-section">
        <h3 className="section-title">Your Reviews and Rankings</h3>
        {combinedData && combinedData.length > 0 ? (
          combinedData.map((data) => (
            <div key={data.id} className="review-ranking-item">
              <p className="review-player">{getPlayerDetails(data.player_id)}</p>
              <p className="review-content">Review: {data.content}</p>
              <p className="ranking-value">Ranking: {data.rank}</p>
              <button
                className="delete-button"
                onClick={() => handleDeleteReviewAndRanking(data.id, data.player_id)}
              >
                Delete Review & Ranking
              </button>
            </div>
          ))
        ) : (
          <p className="no-reviews-rankings-message">No reviews or rankings available.</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
