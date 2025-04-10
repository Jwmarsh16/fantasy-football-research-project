import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { VariableSizeList as List } from 'react-window';
import {
  fetchUserById, setUserDetails, fetchUsers
} from '../redux/slices/userSlice';
import {
  fetchRankings, deleteRanking, updateRanking
} from '../redux/slices/rankingSlice';
import {
  fetchReviews, deleteReview, updateReview
} from '../redux/slices/reviewSlice';
import { deleteUser } from '../redux/slices/authSlice';

import UserInfoCard from '../components/profile/UserInfoCard';
import ReviewFilterSort from '../components/profile/ReviewFilterSort';
import ReviewRow from '../components/profile/ReviewRow';
import EditReviewModal from '../components/profile/EditReviewModal';

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
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [openMenuReviewId, setOpenMenuReviewId] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);
  const [rowHeights, setRowHeights] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [sortType, setSortType] = useState('ranking');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  const menuRef = useRef(null);
  const parsedUserId = userId ? parseInt(userId, 10) : null;
  const isOwnProfile = currentUser && parsedUserId === currentUser.id;
  const defaultCollapsedHeight = 150;
  const listRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!parsedUserId) {
      navigate('/login');
      return;
    }
    if (!userDetails || userDetails.id !== parsedUserId) {
      dispatch(fetchUserById(parsedUserId)).then((res) => {
        if (res.payload) dispatch(setUserDetails(res.payload));
      });
    }
    dispatch(fetchRankings());
    dispatch(fetchReviews());
    if (players.length === 0) fetchPlayers();
  }, [parsedUserId, userDetails, dispatch, navigate, players.length]);

  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [userDetails]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const avatarUrl =
    userDetails.profilePic && userDetails.profilePic.trim() !== ""
      ? (userDetails.profilePic === "avatar"
        ? `https://i.pravatar.cc/150?u=${userDetails.id}`
        : userDetails.profilePic)
      : "https://placehold.co/600x400?text=Upload+Picture";

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const userReviews = reviews.filter((r) => r.user_id === parsedUserId);
  const userReviewsWithData = userReviews.map((review) => {
    const player = players.find((p) => p.id === review.player_id);
    const rankingObj = rankings.find((rank) => (
      rank.user_id === parsedUserId && rank.player_id === review.player_id
    ));
    return {
      ...review,
      ranking: rankingObj?.rank ?? null,
      ranking_id: rankingObj?.id ?? null,
      team: player?.team ?? '',
      position: player?.position ?? '',
      playerName: player?.name ?? 'Unknown Player',
    };
  });

  const teams = [...new Set(userReviewsWithData.map((r) => r.team).filter(Boolean))];
  const positions = [...new Set(players.map((p) => p.position))];

  let filteredReviews = [...userReviewsWithData];
  if (filterTeam) filteredReviews = filteredReviews.filter(r => r.team === filterTeam);
  if (filterPosition) filteredReviews = filteredReviews.filter(r => r.position === filterPosition);

  if (sortType === 'team') {
    filteredReviews.sort((a, b) => a.team.localeCompare(b.team));
  } else if (sortType === 'position') {
    filteredReviews.sort((a, b) => a.position.localeCompare(b.position));
  } else {
    filteredReviews.sort((a, b) => {
      const aRank = a.ranking ?? Infinity;
      const bRank = b.ranking ?? Infinity;
      return aRank - bRank;
    });
  }

  const finalSortedReviews = filteredReviews;

  const getItemSize = (index) => {
    const review = finalSortedReviews[index];
    return expandedReviewIds.includes(review.id)
      ? rowHeights[index] || (60 + Math.ceil(review.content.length / 90) * 20 + 30 + 20 + 30)
      : defaultCollapsedHeight;
  };

  useEffect(() => {
    if (listRef.current) listRef.current.resetAfterIndex(0, true);
  }, [rowHeights, expandedReviewIds]);

  const updateRowHeight = useCallback((index, height) => {
    setRowHeights((prev) => {
      if (Math.abs((prev[index] ?? 0) - height) < 1) return prev;
      return { ...prev, [index]: height };
    });
  }, []);

  const toggleReviewExpansion = (id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteReviewAndRanking = async (reviewId, playerId) => {
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      const ranking = rankings.find(r => r.user_id === parsedUserId && r.player_id === playerId);
      if (ranking) await dispatch(deleteRanking(ranking.id)).unwrap();
    } catch (err) {
      console.error('Failed to delete review and ranking:', err);
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to delete your profile?")) {
      try {
        await dispatch(deleteUser(parsedUserId)).unwrap();
        navigate('/register');
      } catch (err) {
        alert("Failed to delete profile.");
      }
    }
  };

  const handleFilterByPosition = (pos) => {
    setFilterPosition(pos);
    setFilterTeam('');
    setExpandedReviewIds([]);
  };

  const handleFilterByTeam = (e) => {
    setFilterTeam(e.target.value);
    setFilterPosition('');
    setExpandedReviewIds([]);
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
    setExpandedReviewIds([]);
  };

  const handleClearFilters = () => {
    setFilterTeam('');
    setFilterPosition('');
    setSortType('ranking');
    setExpandedReviewIds([]);
  };

  return (
    <div className="profile-container">
      <div className="profile-page">
        <div className="profile-header">
          <h2 className="profile-title">User Profile</h2>
        </div>

        {isOwnProfile && (
          <div className="profile-menu-container" ref={menuRef}>
            <button className={`profile-menu-toggle ${showMenu ? 'open' : ''}`} onClick={toggleMenu}>
              <span className="bar"></span><span className="bar"></span><span className="bar"></span>
            </button>
            {showMenu && (
              <div className="profile-menu">
                <ul>
                  <li onClick={() => navigate('/profile/edit')}>Edit Profile</li>
                  <li onClick={() => navigate('/profile/account')}>Account Settings</li>
                  <li onClick={() => handleDeleteProfile()}>Delete Profile</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <UserInfoCard
          avatarUrl={avatarUrl}
          userDetails={userDetails}
          currentUser={currentUser}
          parsedUserId={parsedUserId}
          onProfilePicUpdate={(data) => {
            if (!data?.profilePic) return;
            dispatch(setUserDetails({ ...userDetails, profilePic: data.profilePic }));
            dispatch(fetchUsers());
          }}
        />

        <div className="reviews-rankings-section">
          <h3 className="section-title">Your Reviews and Rankings</h3>

          <ReviewFilterSort
            positions={positions}
            teams={teams}
            filterTeam={filterTeam}
            sortType={sortType}
            handleFilterByPosition={handleFilterByPosition}
            handleFilterByTeam={handleFilterByTeam}
            handleSortChange={handleSortChange}
            handleClearFilters={handleClearFilters}
          />

          {finalSortedReviews.length > 0 ? (
            isMobile ? (
              <div className="reviews-list">
                {finalSortedReviews.map((review, index) => (
                  <ReviewRow
                    key={review.id}
                    index={index}
                    review={review}
                    style={{}}
                    isExpanded={expandedReviewIds.includes(review.id)}
                    currentUser={currentUser}
                    parsedUserId={parsedUserId}
                    openMenuReviewId={openMenuReviewId}
                    toggleReviewExpansion={toggleReviewExpansion}
                    setOpenMenuReviewId={setOpenMenuReviewId}
                    setEditingReview={setEditingReview}
                    handleDeleteReviewAndRanking={handleDeleteReviewAndRanking}
                    updateRowHeight={updateRowHeight}
                  />
                ))}
              </div>
            ) : (
              <List
                ref={listRef}
                height={600}
                itemCount={finalSortedReviews.length}
                itemSize={getItemSize}
                width="100%"
                style={{ overflowX: 'hidden' }}
              >
                {({ index, style }) => (
                  <ReviewRow
                    index={index}
                    review={finalSortedReviews[index]}
                    style={style}
                    isExpanded={expandedReviewIds.includes(finalSortedReviews[index].id)}
                    currentUser={currentUser}
                    parsedUserId={parsedUserId}
                    openMenuReviewId={openMenuReviewId}
                    toggleReviewExpansion={toggleReviewExpansion}
                    setOpenMenuReviewId={setOpenMenuReviewId}
                    setEditingReview={setEditingReview}
                    handleDeleteReviewAndRanking={handleDeleteReviewAndRanking}
                    updateRowHeight={updateRowHeight}
                  />
                )}
              </List>
            )
          ) : (
            <p className="no-reviews-rankings-message">No reviews or rankings available.</p>
          )}
        </div>

        {editingReview && (
          <EditReviewModal
            review={editingReview}
            onClose={() => setEditingReview(null)}
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
          />
        )}
      </div>
    </div>
  );
}

export default Profile;
