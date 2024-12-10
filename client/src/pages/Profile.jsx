import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserById, setUserDetails } from '../redux/slices/userSlice';
import { fetchRankings, deleteRanking } from '../redux/slices/rankingSlice';
import { fetchReviews, deleteReview } from '../redux/slices/reviewSlice';
import { deleteUser } from '../redux/slices/authSlice';
import axios from 'axios';
import '../style/ProfileStyle.css';

function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userDetails = useSelector((state) => state.user.userDetails);
  const reviews = useSelector((state) => state.review.reviews);
  const rankings = useSelector((state) => state.ranking.rankings);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    } else {
      if (!userDetails || userDetails.id !== parseInt(userId)) {
        dispatch(fetchUserById(userId))
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
  }, [userId, userDetails, dispatch, navigate]);

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
      await dispatch(deleteReview(reviewId)).unwrap();
      const ranking = rankings.find(
        (ranking) => ranking.user_id === parseInt(userId) && ranking.player_id === playerId
      );
      if (ranking) {
        await dispatch(deleteRanking(ranking.id)).unwrap();
      }
    } catch (error) {
      console.error('Failed to delete review and ranking:', error);
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        navigate('/');
      } catch (error) {
        console.error('Failed to delete user profile:', error);
      }
    }
  };

  if (!userDetails) {
    return <p className="loading-message">Loading user details...</p>;
  }

  const combinedData = reviews
    .filter((review) => review.user_id === parseInt(userId))
    .map((review) => {
      const ranking = rankings.find((ranking) => ranking.user_id === parseInt(userId) && ranking.player_id === review.player_id);
      return {
        ...review,
        rank: ranking ? ranking.rank : 'N/A',
      };
    });

    return (
      <div className="profile-page">
        <div className="profile-header">
          <h2 className="profile-title">User Profile</h2>
          {currentUser && currentUser.id === parseInt(userId) && (
            <button className="delete-profile-button" onClick={handleDeleteProfile}>
              Delete Profile
            </button>
          )}
        </div>
        <div className="user-info">
          <div className="user-avatar-section">
            {/* User Avatar */}
            <img 
              src={`https://i.pravatar.cc/150?u=${userDetails.id}`} 
              alt={`${userDetails.username}'s Avatar`} 
              className="user-avatar-img" 
            />
          </div>
          <div className="user-info-section">
            <p className="user-detail"><strong>Username:</strong> {userDetails.username}</p>
            <p className="user-detail"><strong>Email:</strong> {userDetails.email}</p>
          </div>
        </div>
        <div className="reviews-rankings-section">
          <h3 className="section-title">Your Reviews and Rankings</h3>
          {combinedData && combinedData.length > 0 ? (
            combinedData.map((data) => (
              <div key={data.id} className="review-ranking-item">
                <div className="review-header">
                  <p className="review-player">{getPlayerDetails(data.player_id)}</p>
                  {currentUser && currentUser.id === parseInt(userId) && (
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteReviewAndRanking(data.id, data.player_id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="review-content"><strong>Review:</strong> {data.content}</p>
                <p className="ranking-value"><strong>Ranking:</strong> {data.rank}</p>
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
