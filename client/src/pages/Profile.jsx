import React, { useEffect, useState, useRef } from 'react';
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
  const [forceUpdate, setForceUpdate] = useState(0); // Forces re-render when userDetails update
  const [showMenu, setShowMenu] = useState(false);   // State for the settings menu

  // State variables for filtering and sorting the user's rankings.
  const [sortType, setSortType] = useState('');         // Options: '', 'team', 'position', or 'ranking'
  const [filterTeam, setFilterTeam] = useState('');       // Filter reviews by player's team
  const [filterPosition, setFilterPosition] = useState(''); // Filter reviews by player's position

  // Create a ref for the menu container to detect outside clicks
  const menuRef = useRef(null);

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
    setForceUpdate((prev) => prev + 1); // Force re-render when userDetails changes
  }, [userDetails]);

  // useEffect for closing the menu when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Helper function to get player details string.
  // (Not used in the review display anymore to avoid duplicate player name.)
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

  // Determine the avatar URL.
  let avatarUrl;
  if (userDetails.profilePic && userDetails.profilePic.trim() !== "") {
    if (userDetails.profilePic === "avatar") {
      avatarUrl = `https://i.pravatar.cc/150?u=${userDetails.id}`;
    } else {
      avatarUrl = userDetails.profilePic;
    }
  } else {
    avatarUrl = "https://placehold.co/600x400?text=Upload+Picture";
  }

  // Toggle function for the settings menu
  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  // Filter reviews for the current user.
  const userReviews = reviews.filter((review) => review.user_id === parsedUserId);

  // Create a combined array of user reviews that includes:
  // - The corresponding ranking (if exists)
  // - Player information (team, position, name) from the players array.
  // This additional player data will be used for filtering and sorting.
  const userReviewsWithPlayerData = userReviews.map((review) => {
    const player = players.find((p) => p.id === review.player_id);
    const rankingObj = rankings.find(
      (rank) => rank.user_id === parsedUserId && rank.player_id === review.player_id
    );
    return {
      ...review,
      ranking: rankingObj ? rankingObj.rank : null,
      team: player ? player.team : '',
      position: player ? player.position : '',
      playerName: player ? player.name : 'Unknown Player',
    };
  });

  // Filtering & Sorting Logic
  // Compute unique teams from the reviews data.
  const teams = [...new Set(userReviewsWithPlayerData.map((r) => r.team).filter(Boolean))];

  // Derive available positions from the complete players list (to always show all positions)
  const positions = [...new Set(players.map((p) => p.position))];

  // Filter reviews based on selected team and/or position.
  let filteredReviews = [...userReviewsWithPlayerData];
  if (filterTeam) {
    filteredReviews = filteredReviews.filter((review) => review.team === filterTeam);
  }
  if (filterPosition) {
    filteredReviews = filteredReviews.filter((review) => review.position === filterPosition);
  }

  // Sort reviews based on the selected sort type.
  if (sortType === 'team') {
    filteredReviews.sort((a, b) => a.team.localeCompare(b.team));
  } else if (sortType === 'position') {
    filteredReviews.sort((a, b) => a.position.localeCompare(b.position));
  } else if (sortType === 'ranking') {
    filteredReviews.sort((a, b) => {
      const aRank = a.ranking !== null ? a.ranking : Infinity;
      const bRank = b.ranking !== null ? b.ranking : Infinity;
      return aRank - bRank;
    });
  }
  const finalSortedReviews = filteredReviews;

  // Event handlers for filtering and sorting controls.
  const handleFilterByPosition = (position) => {
    setFilterPosition(position);
    setFilterTeam(''); // Clear team filter when filtering by position
  };

  const handleFilterByTeam = (e) => {
    setFilterTeam(e.target.value);
    setFilterPosition(''); // Clear position filter when filtering by team
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };

  const handleClearFilters = () => {
    setFilterTeam('');
    setFilterPosition('');
    setSortType('');
  };

  return (
    <div className="profile-container">
      <div className="profile-page">
        <div className="profile-header">
          <h2 className="profile-title">User Profile</h2>
          {/* Remove delete button from header */}
        </div>

        {/* Settings Menu Toggle */}
        {currentUser && parsedUserId === currentUser.id && (
          <div className="profile-menu-container" ref={menuRef}>
            <button
              className={`profile-menu-toggle ${showMenu ? 'open' : ''}`}
              onClick={toggleMenu}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
            {showMenu && (
              <div className="profile-menu">
                <ul>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/edit')}>Edit Profile</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/account')}>Account Settings</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/privacy')}>Privacy Settings</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/security')}>Security Settings</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/notifications')}>Notification Settings</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/language')}>Language & Accessibility Options</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/content')}>Content & Ad Preferences</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/data')}>Data & Privacy Tools</li>
                  <li style={{ cursor: 'pointer' }} onClick={handleDeleteProfile}>Delete Profile</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="user-info">
          <div className="user-avatar-section">
            <img
              src={avatarUrl}
              alt={`${userDetails.username}'s Avatar`}
              className="user-avatar-img"
              key={forceUpdate} // Forces re-render when profile picture changes
            />
            {currentUser && parsedUserId === currentUser.id && (
              <ProfilePicUpdater 
                userId={parsedUserId} 
                onUpdate={(data) => {
                  if (!data || !data.profilePic) return;
                  dispatch(setUserDetails({ ...userDetails, profilePic: data.profilePic }));
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

          {/* Filtering & Sorting Controls */}
          <div className="filter-sort-container">
            {/* Position Filter Circles */}
            <div className="position-filter-container">
              {positions.map((position) => (
                <button
                  key={position}
                  className="position-filter-circle"
                  onClick={() => handleFilterByPosition(position)}
                >
                  {position}
                </button>
              ))}
            </div>

            {/* Team Dropdown for Filtering */}
            <div className="team-filter-container">
              <label htmlFor="team-filter" className="team-filter-label">Filter by Team:</label>
              <select
                id="team-filter"
                value={filterTeam}
                onChange={handleFilterByTeam}
                className="team-filter-dropdown"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options Dropdown */}
            <div className="sort-options">
              <label htmlFor="sort">Sort by: </label>
              <select id="sort" value={sortType} onChange={handleSortChange} className="sort-select">
                <option value="">Select</option>
                <option value="team">Team</option>
                <option value="position">Position</option>
                <option value="ranking">Ranking</option>
              </select>
              <button onClick={handleClearFilters} className="clear-filters-button">Clear Filters</button>
            </div>
          </div>
          {/* End Filtering & Sorting Controls */}

          {/* Display Filtered and Sorted Reviews/Rankings */}
          {finalSortedReviews.length > 0 ? (
            finalSortedReviews.map((review) => (
              <div key={review.id} className="review-ranking-item">
                <div className="review-header">
                  {/* 
                    The player's name is now displayed with extra details in a neat, organized block.
                  */}
                  <div className="review-player-info">
                    <p className="review-player">{review.playerName}</p>
                    <p className="player-details">{review.position} | {review.team}</p>
                  </div>
                  <p className="ranking-info">
                    <strong>Ranking:</strong> {review.ranking !== null ? review.ranking : 'N/A'}
                  </p>
                  {currentUser.id === parsedUserId && (
                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteReviewAndRanking(review.id, review.player_id)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="review-content">
                  <strong>Review:</strong> {review.content}
                </p>
              </div>
            ))
          ) : (
            <p className="no-reviews-rankings-message">
              No reviews or rankings available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
