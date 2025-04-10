import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useCallback
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { VariableSizeList as List } from 'react-window';
import {
  fetchUserById,
  setUserDetails,
  fetchUsers
} from '../redux/slices/userSlice';
import {
  fetchRankings,
  deleteRanking,
  updateRanking
} from '../redux/slices/rankingSlice';
import {
  fetchReviews,
  deleteReview,
  updateReview
} from '../redux/slices/reviewSlice';
import { deleteUser } from '../redux/slices/authSlice';

import '../style/ProfileStyle.css';
import UserInfoCard from '../components/profile/UserInfoCard';
import ProfileMenu from '../components/profile/ProfileMenu';
import ReviewFilterSort from '../components/profile/ReviewFilterSort';
import ReviewRow from '../components/profile/ReviewRow';
import EditReviewModal from '../components/profile/EditReviewModal';

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
  const listRef = useRef(null);
  const defaultCollapsedHeight = 150;

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
      dispatch(fetchUserById(parsedUserId))
        .unwrap()
        .then((res) => res && dispatch(setUserDetails(res)))
        .catch((err) => console.error('Error fetching user details:', err));
    }

    dispatch(fetchRankings());
    dispatch(fetchReviews());

    if (players.length === 0) fetchPlayers();
  }, [parsedUserId, userDetails, dispatch, navigate, players.length]);

  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [userDetails]);

  const fetchPlayers = async () => {
    try {
      const res = await axios.get('/api/players');
      setPlayers(res.data);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  const handleDeleteReviewAndRanking = async (reviewId, playerId) => {
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      const ranking = rankings.find(
        (r) => r.user_id === parsedUserId && r.player_id === playerId
      );
      if (ranking) await dispatch(deleteRanking(ranking.id)).unwrap();
    } catch (err) {
      console.error('Failed to delete review and ranking:', err);
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        await dispatch(deleteUser(parsedUserId)).unwrap();
        navigate('/register');
      } catch (err) {
        console.error('Failed to delete user profile:', err);
        alert('Failed to delete profile. Please try again.');
      }
    }
  };

  const avatarUrl =
    userDetails.profilePic?.trim() === 'avatar'
      ? `https://i.pravatar.cc/150?u=${userDetails.id}`
      : userDetails.profilePic?.trim()
      ? userDetails.profilePic
      : 'https://placehold.co/600x400?text=Upload+Picture';

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviewIds((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const updateRowHeight = useCallback((index, height) => {
    setRowHeights((prev) => {
      const current = prev[index];
      if (current !== undefined && Math.abs(current - height) < 1) return prev;
      return { ...prev, [index]: height };
    });
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.resetAfterIndex(0, true);
  }, [rowHeights, expandedReviewIds]);

  const handleFilterByPosition = (position) => {
    setFilterPosition(position);
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

  const userReviews = reviews.filter((r) => r.user_id === parsedUserId);
  const teams = [...new Set(userReviews.map((r) => {
    const p = players.find((pl) => pl.id === r.player_id);
    return p?.team;
  }).filter(Boolean))];

  const positions = [...new Set(players.map((p) => p.position))];

  const userReviewsWithData = userReviews.map((review) => {
    const player = players.find((p) => p.id === review.player_id);
    const rankObj = rankings.find(
      (r) => r.user_id === parsedUserId && r.player_id === review.player_id
    );
    return {
      ...review,
      playerName: player?.name || 'Unknown Player',
      team: player?.team || '',
      position: player?.position || '',
      ranking: rankObj ? rankObj.rank : null,
      ranking_id: rankObj?.id || null
    };
  });

  let filtered = [...userReviewsWithData];
  if (filterTeam) filtered = filtered.filter((r) => r.team === filterTeam);
  if (filterPosition) filtered = filtered.filter((r) => r.position === filterPosition);

  filtered.sort((a, b) => {
    if (sortType === 'team') return a.team.localeCompare(b.team);
    if (sortType === 'position') return a.position.localeCompare(b.position);
    const aRank = a.ranking !== null ? a.ranking : Infinity;
    const bRank = b.ranking !== null ? b.ranking : Infinity;
    return aRank - bRank;
  });

  const getItemSize = (index) => {
    const review = filtered[index];
    return expandedReviewIds.includes(review.id)
      ? rowHeights[index] || 240
      : defaultCollapsedHeight;
  };

  return (
    <div className="profile-container">
      <div className="profile-page">
        <div className="profile-header">
          <h2 className="profile-title">User Profile</h2>
        </div>

        <ProfileMenu
          currentUser={currentUser}
          parsedUserId={parsedUserId}
          navigate={navigate}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          handleDeleteProfile={handleDeleteProfile}
        />

        <UserInfoCard
          avatarUrl={avatarUrl}
          forceUpdate={forceUpdate}
          userDetails={userDetails}
          currentUser={currentUser}
          parsedUserId={parsedUserId}
          dispatch={dispatch}
          fetchUsers={fetchUsers}
          setUserDetails={setUserDetails}
        />

        <div className="reviews-rankings-section">
          <h3 className="section-title">Your Reviews and Rankings</h3>

          <ReviewFilterSort
            teams={teams}
            positions={positions}
            sortType={sortType}
            filterTeam={filterTeam}
            handleFilterByTeam={handleFilterByTeam}
            handleFilterByPosition={handleFilterByPosition}
            handleSortChange={handleSortChange}
            handleClearFilters={handleClearFilters}
          />

          <div className="reviews-list">
            {filtered.length > 0 ? (
              isMobile ? (
                filtered.map((review, index) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    index={index}
                    isExpanded={expandedReviewIds.includes(review.id)}
                    currentUser={currentUser}
                    parsedUserId={parsedUserId}
                    openMenuReviewId={openMenuReviewId}
                    setOpenMenuReviewId={setOpenMenuReviewId}
                    setEditingReview={setEditingReview}
                    handleDeleteReviewAndRanking={handleDeleteReviewAndRanking}
                    toggleReviewExpansion={toggleReviewExpansion}
                    updateRowHeight={updateRowHeight}
                  />
                ))
              ) : (
                <List
                  ref={listRef}
                  height={600}
                  itemCount={filtered.length}
                  itemSize={getItemSize}
                  width="100%"
                  style={{ overflowX: 'hidden' }}
                >
                  {({ index, style }) => (
                    <ReviewRow
                      key={filtered[index].id}
                      review={filtered[index]}
                      index={index}
                      style={style}
                      isExpanded={expandedReviewIds.includes(filtered[index].id)}
                      currentUser={currentUser}
                      parsedUserId={parsedUserId}
                      openMenuReviewId={openMenuReviewId}
                      setOpenMenuReviewId={setOpenMenuReviewId}
                      setEditingReview={setEditingReview}
                      handleDeleteReviewAndRanking={handleDeleteReviewAndRanking}
                      toggleReviewExpansion={toggleReviewExpansion}
                      updateRowHeight={updateRowHeight}
                    />
                  )}
                </List>
              )
            ) : (
              <p className="no-reviews-rankings-message">
                No reviews or rankings available.
              </p>
            )}
          </div>
        </div>
      </div>

      {editingReview && (
        <EditReviewModal
          editingReview={editingReview}
          setEditingReview={setEditingReview}
          dispatch={dispatch}
          parsedUserId={parsedUserId}
          updateRanking={updateRanking}
          updateReview={updateReview}
          fetchReviews={fetchReviews}
          fetchRankings={fetchRankings}
        />
      )}
    </div>
  );
}

export default Profile;
