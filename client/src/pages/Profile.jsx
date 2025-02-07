import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserById, setUserDetails, fetchUsers } from '../redux/slices/userSlice';
import { fetchRankings, deleteRanking } from '../redux/slices/rankingSlice';
import { fetchReviews, deleteReview } from '../redux/slices/reviewSlice';
import { deleteUser } from '../redux/slices/authSlice';
import axios from 'axios';
import '../style/ProfileStyle.css';
import ProfilePicUpdater from '../components/user/ProfilePicUpdater';

function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userDetails = useSelector((state) => state.user.userDetails);
  const reviews = useSelector((state) => state.review.reviews);
  const rankings = useSelector((state) => state.ranking.rankings);
  const [players, setPlayers] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0); // ✅ Added state for forcing re-render

  const parsedUserId = userId ? parseInt(userId, 10) : null;

  useEffect(() => {
    if (!parsedUserId) {
      navigate('/login');
      return;
    }

    if (!userDetails || userDetails.id !== parsedUserId) {
      dispatch(fetchUserById(parsedUserId))
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

    if (players.length === 0) {
      fetchPlayers();
    }
  }, [parsedUserId, userDetails, dispatch, navigate, players.length]);

  useEffect(() => {
    console.log("Profile.jsx - Redux state updated:", userDetails);
    setForceUpdate((prev) => prev + 1); // ✅ Force re-render when Redux state updates
  }, [userDetails]);

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
        (ranking) => ranking.user_id === parsedUserId && ranking.player_id === playerId
      );
      if (ranking) {
        await dispatch(deleteRanking(ranking.id)).unwrap();
      }
    } catch (error) {
      console.error('Failed to delete review and ranking:', error);
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentUser) {
      console.error("Current user is null. Cannot delete profile.");
      return;
    }
    if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      try {
        await dispatch(deleteUser(parsedUserId)).unwrap();
        navigate('/');
      } catch (error) {
        console.error("Failed to delete user profile:", error);
        alert("Failed to delete profile. Please try again.");
      }
    }
  };

  // ✅ Ensure profile picture logic works correctly:
  // ✅ Ensure profile picture logic works correctly:
  let avatarUrl;
  if (userDetails.profilePic === "avatar") {
    avatarUrl = `https://i.pravatar.cc/150?u=${userDetails.id}`; // ✅ Display fake user avatar
  } else if (userDetails.profilePic && userDetails.profilePic.trim() !== "" && userDetails.profilePic !== "avatar") {
    avatarUrl = userDetails.profilePic; // ✅ Directly use the pre-signed S3 URL for real users
  } else {
    avatarUrl = "https://placehold.co/600x400?text=Upload+Picture"; // ✅ Default placeholder for users with no image
  }



  const userReviews = reviews.filter((review) => review.user_id === parsedUserId);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2 className="profile-title">User Profile</h2>
        {currentUser && parsedUserId === currentUser.id ? (
          <button className="delete-profile-button" onClick={handleDeleteProfile}>
            Delete Profile
          </button>
        ) : (
          <p className="error-message">You do not have permission to delete this profile.</p>
        )}
      </div>
      <div className="user-info">
        <div className="user-avatar-section">
          <img
            src={avatarUrl}
            alt={`${userDetails.username}'s Avatar`}
            className="user-avatar-img"
            key={forceUpdate} // ✅ Forces re-render when profile picture changes
          />
          {currentUser && parsedUserId === currentUser.id && (
            <ProfilePicUpdater 
              userId={parsedUserId} 
              onUpdate={(data) => {
                if (!data || !data.profilePic) return;

                dispatch(setUserDetails({ ...userDetails, profilePic: data.profilePic })); // ✅ Ensure Redux updates instantly
                dispatch(fetchUsers());
              }} 
            />
          )}
        </div>
        <div className="user-info-section">
          <p className="user-detail"><strong>Username:</strong> {userDetails.username}</p>
          <p className="user-detail"><strong>Email:</strong> {userDetails.email}</p>
        </div>
      </div>
      <div className="reviews-rankings-section">
        <h3 className="section-title">Your Reviews and Rankings</h3>
        {userReviews.length > 0 ? (
          userReviews.map((review) => (
            <div key={review.id} className="review-ranking-item">
              <div className="review-header">
                <p className="review-player">{getPlayerDetails(review.player_id)}</p>
                {currentUser.id === parsedUserId && (
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteReviewAndRanking(review.id, review.player_id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="review-content"><strong>Review:</strong> {review.content}</p>
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
