import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserById, setUserDetails, fetchUsers } from '../redux/slices/userSlice';
import { fetchRankings, deleteRanking, updateRanking } from '../redux/slices/rankingSlice';
import { fetchReviews, deleteReview, updateReview } from '../redux/slices/reviewSlice';
import { deleteUser } from '../redux/slices/authSlice';
import axios from 'axios';
// Import VariableSizeList for dynamic row heights.
import { VariableSizeList as List } from 'react-window';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
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
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [openMenuReviewId, setOpenMenuReviewId] = useState(null);
  // State to track the review currently being edited via the modal.
  const [editingReview, setEditingReview] = useState(null);
  // State to track which reviews are expanded (for showing full content).
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  // Filtering and sorting state.
  // Default sortType is 'ranking' to sort by rank.
  const [sortType, setSortType] = useState('ranking');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  const menuRef = useRef(null);
  const parsedUserId = userId ? parseInt(userId, 10) : null;

  // Create a ref for the VariableSizeList to allow dynamic row height resets.
  const listRef = useRef(null);

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
    setForceUpdate((prev) => prev + 1);
  }, [userDetails]);

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
        navigate('/register');
      } catch (error) {
        console.error("Failed to delete user profile:", error);
        alert("Failed to delete profile. Please try again.");
      }
    }
  };

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

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  // Filter reviews for the current user.
  const userReviews = reviews.filter((review) => review.user_id === parsedUserId);

  // Combine each review with its ranking and player info.
  const userReviewsWithPlayerData = userReviews.map((review) => {
    const player = players.find((p) => p.id === review.player_id);
    const rankingObj = rankings.find(
      (rank) => rank.user_id === parsedUserId && rank.player_id === review.player_id
    );
    return {
      ...review,
      ranking: rankingObj ? rankingObj.rank : null,
      ranking_id: rankingObj ? rankingObj.id : null, // Store ranking ID for updates.
      team: player ? player.team : '',
      position: player ? player.position : '',
      playerName: player ? player.name : 'Unknown Player',
    };
  });

  const teams = [...new Set(userReviewsWithPlayerData.map((r) => r.team).filter(Boolean))];
  const positions = [...new Set(players.map((p) => p.position))];

  let filteredReviews = [...userReviewsWithPlayerData];
  if (filterTeam) filteredReviews = filteredReviews.filter((review) => review.team === filterTeam);
  if (filterPosition) filteredReviews = filteredReviews.filter((review) => review.position === filterPosition);
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

  // Modified getItemSize: Calculate expanded row height based on review content length.
  // Added an extra constant (20px) so the "Hide Review" button is fully visible.
  const getItemSize = (index) => {
    const review = finalSortedReviews[index];
    const collapsedHeight = 200; // Default row height when not expanded.
    if (expandedReviewIds.includes(review.id)) {
      const contentLines = Math.ceil(review.content.length / 50);
      // Constants: header (80px), estimated content (contentLines * 20px), button (30px), padding (20px),
      // plus an extra 20px for ensuring the button is fully visible.
      const estimatedExpandedHeight = 80 + contentLines * 20 + 30 + 20 + 20;
      return Math.max(collapsedHeight, estimatedExpandedHeight);
    } else {
      return collapsedHeight;
    }
  };

  // Reset the list's row sizes whenever expandedReviewIds changes.
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [expandedReviewIds]);

  // Toggle review expansion.
  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviewIds((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    );
  };

  // UPDATED: When filtering by position, collapse all expanded reviews.
  const handleFilterByPosition = (position) => {
    setFilterPosition(position);
    setFilterTeam('');
    setExpandedReviewIds([]); // Collapse expanded reviews
  };

  // UPDATED: When filtering by team, collapse all expanded reviews.
  const handleFilterByTeam = (e) => {
    setFilterTeam(e.target.value);
    setFilterPosition('');
    setExpandedReviewIds([]); // Collapse expanded reviews
  };

  // UPDATED: When sorting method changes, collapse all expanded reviews.
  const handleSortChange = (e) => {
    setSortType(e.target.value);
    setExpandedReviewIds([]); // Collapse expanded reviews
  };

  // UPDATED: When clearing filters, reset sortType to 'ranking' and collapse expanded reviews.
  const handleClearFilters = () => {
    setFilterTeam('');
    setFilterPosition('');
    setSortType('ranking');
    setExpandedReviewIds([]); // Collapse expanded reviews
  };

  // Define a row component for virtualization.
  const ReviewRow = ({ index, style }) => {
    const review = finalSortedReviews[index];
    return (
      <div key={review.id} className="review-ranking-item" style={{ ...style, overflowX: 'visible' }}>
        <div className="review-header" style={{ position: 'relative' }}>
          <div className="review-player-info">
            <p className="review-player">{review.playerName}</p>
            <p className="player-details">{review.position} | {review.team}</p>
          </div>
          <p className="ranking-info">
            <strong>Ranking:</strong> {review.ranking !== null ? review.ranking : 'N/A'}
          </p>
          {currentUser.id === parsedUserId && (
            <div className="review-menu-container" style={{ position: 'absolute', top: '5px', right: '5px' }}>
              <button
                className="review-menu-button"
                style={{ transform: 'translateY(-0.5em)' }}
                onClick={() =>
                  setOpenMenuReviewId(openMenuReviewId === review.id ? null : review.id)
                }
              >
                ⋮
              </button>
              {openMenuReviewId === review.id && (
                <div className="review-menu" style={{ top: '22px', right: '5px' }}>
                  <button
                    className="review-menu-item"
                    onClick={() => { setEditingReview(review); setOpenMenuReviewId(null); }}
                  >
                    Edit
                  </button>
                  <button
                    className="review-menu-item"
                    onClick={() => { handleDeleteReviewAndRanking(review.id, review.player_id); setOpenMenuReviewId(null); }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="review-condensed">
          {expandedReviewIds.includes(review.id) ? (
            <div className="review-content">
              <p><strong>Review:</strong> {review.content}</p>
              <button onClick={() => toggleReviewExpansion(review.id)} className="toggle-review-button">
                Hide Review
              </button>
            </div>
          ) : (
            <button onClick={() => toggleReviewExpansion(review.id)} className="toggle-review-button">
              Show Review
            </button>
          )}
        </div>
      </div>
    );
  };

  // Edit modal for review and ranking updates.
  // UPDATED: Added max(450, ...) to the Yup schema for "content" to enforce a 450-character limit.
  const EditReviewModal = ({ review, onClose }) => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Edit Review for {review.playerName}</h3>
          <Formik
            initialValues={{
              rank: review.ranking !== null ? review.ranking : '',
              content: review.content,
            }}
            validationSchema={Yup.object({
              rank: Yup.number()
                .min(1, 'Rank must be at least 1')
                .max(100, 'Rank must be at most 100')
                .required('Required'),
              content: Yup.string()
                .max(450, 'Review cannot exceed 450 characters')
                .required('Required'),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                if (review.ranking_id) {
                  await dispatch(updateRanking({
                    id: review.ranking_id,
                    player_id: review.player_id,
                    user_id: parsedUserId,
                    rank: values.rank,
                  })).unwrap();
                }
                await dispatch(updateReview({
                  id: review.id,
                  player_id: review.player_id,
                  user_id: parsedUserId,
                  content: values.content,
                })).unwrap();
                dispatch(fetchReviews());
                dispatch(fetchRankings());
                onClose();
              } catch (error) {
                console.error('Failed to update review and ranking:', error);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="edit-review-form">
                <div className="form-group">
                  <label htmlFor={`modal-edit-rank-${editingReview.id}`}>Rank</label>
                  <Field type="number" id={`modal-edit-rank-${editingReview.id}`} name="rank" className="input-field" />
                  <ErrorMessage name="rank" component="div" className="error-message" />
                </div>
                <div className="form-group">
                  <label htmlFor={`modal-edit-content-${editingReview.id}`}>Review</label>
                  <Field as="textarea" id={`modal-edit-content-${editingReview.id}`} name="content" className="input-field" />
                  <ErrorMessage name="content" component="div" className="error-message" />
                </div>
                <button type="submit" disabled={isSubmitting} className="submit-button">Update</button>
                <button type="button" onClick={() => setEditingReview(null)} className="cancel-button">Cancel</button>
              </Form>
            )}
          </Formik>
          <button className="modal-close-button" onClick={() => setEditingReview(null)}>
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-page">
        <div className="profile-header">
          <h2 className="profile-title">User Profile</h2>
        </div>

        {/* Settings Menu Toggle */}
        {currentUser && parsedUserId === currentUser.id && (
          <div className="profile-menu-container" ref={menuRef}>
            <button className={`profile-menu-toggle ${showMenu ? 'open' : ''}`} onClick={toggleMenu}>
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
            <img src={avatarUrl} alt={`${userDetails.username}'s Avatar`} className="user-avatar-img" key={forceUpdate} />
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
            <div className="position-filter-container">
              {positions.map((position) => (
                <button key={position} className="position-filter-circle" onClick={() => handleFilterByPosition(position)}>
                  {position}
                </button>
              ))}
            </div>
            <div className="team-filter-container">
              <label htmlFor="team-filter" className="team-filter-label">Filter by Team:</label>
              <select id="team-filter" value={filterTeam} onChange={handleFilterByTeam} className="team-filter-dropdown">
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
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

          {/* Virtualized list for faster scrolling through reviews */}
          {finalSortedReviews.length > 0 ? (
            <List
              ref={listRef}
              height={600}
              itemCount={finalSortedReviews.length}
              itemSize={getItemSize}
              width="100%"
              style={{ overflowX: 'hidden' }}
            >
              {ReviewRow}
            </List>
          ) : (
            <p className="no-reviews-rankings-message">No reviews or rankings available.</p>
          )}
        </div>
      </div>

      {/* Edit Modal - shown when editingReview is set */}
      {editingReview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Review for {editingReview.playerName}</h3>
            <Formik
              initialValues={{
                rank: editingReview.ranking !== null ? editingReview.ranking : '',
                content: editingReview.content,
              }}
              validationSchema={Yup.object({
                rank: Yup.number()
                  .min(1, 'Rank must be at least 1')
                  .max(100, 'Rank must be at most 100')
                  .required('Required'),
                content: Yup.string()
                  .max(450, 'Review cannot exceed 450 characters')
                  .required('Required'),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  if (editingReview.ranking_id) {
                    await dispatch(updateRanking({
                      id: editingReview.ranking_id,
                      player_id: editingReview.player_id,
                      user_id: parsedUserId,
                      rank: values.rank,
                    })).unwrap();
                  }
                  await dispatch(updateReview({
                    id: editingReview.id,
                    player_id: editingReview.player_id,
                    user_id: parsedUserId,
                    content: values.content,
                  })).unwrap();
                  dispatch(fetchReviews());
                  dispatch(fetchRankings());
                  setEditingReview(null);
                } catch (error) {
                  console.error('Failed to update review and ranking:', error);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="edit-review-form">
                  <div className="form-group">
                    <label htmlFor={`modal-edit-rank-${editingReview.id}`}>Rank</label>
                    <Field type="number" id={`modal-edit-rank-${editingReview.id}`} name="rank" className="input-field" />
                    <ErrorMessage name="rank" component="div" className="error-message" />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`modal-edit-content-${editingReview.id}`}>Review</label>
                    <Field as="textarea" id={`modal-edit-content-${editingReview.id}`} name="content" className="input-field" />
                    <ErrorMessage name="content" component="div" className="error-message" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="submit-button">Update</button>
                  <button type="button" onClick={() => setEditingReview(null)} className="cancel-button">Cancel</button>
                </Form>
              )}
            </Formik>
            <button className="modal-close-button" onClick={() => setEditingReview(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
