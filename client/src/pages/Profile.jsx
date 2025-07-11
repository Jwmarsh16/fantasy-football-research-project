// src/pages/Profile.jsx
import React, {
  useEffect,
  useState,
  useRef,
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

  const parsedUserId = userId ? parseInt(userId, 10) : null;
  const listRef = useRef(null);

  // Base collapsed height (px) and Gap between rows (px)
  const defaultCollapsedHeight = 150;
  const ROW_GAP = 16; // match var(--space-4) in CSS

  // Recalculate mobile breakpoint
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (!parsedUserId) {
      navigate('/login');
      return;
    }
    if (!userDetails || userDetails.id !== parsedUserId) {
      dispatch(fetchUserById(parsedUserId))
        .unwrap()
        .then((res) => res && dispatch(setUserDetails(res)))
        .catch((err) => console.error(err));
    }
    dispatch(fetchRankings());
    dispatch(fetchReviews());
    if (players.length === 0) fetchPlayers();
  }, [parsedUserId, userDetails, dispatch, navigate, players.length]);

  // Force re-render on userDetails change
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [userDetails]);

  const fetchPlayers = async () => {
    try {
      const res = await axios.get('/api/players');
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        await dispatch(deleteUser(parsedUserId)).unwrap();
        navigate('/register');
      } catch {
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

  // Reset virtualization layout when rows expand/collapse
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [expandedReviewIds]);

  // Prepare filtered & sorted reviews
  const userReviews = reviews.filter((r) => r.user_id === parsedUserId);
  const teams = [...new Set(userReviews.map((r) => {
    const p = players.find((pl) => pl.id === r.player_id);
    return p?.team;
  }).filter(Boolean))];
  const positions = [...new Set(players.map((p) => p.position))];
  const enriched = userReviews.map((r) => {
    const p = players.find((p) => p.id === r.player_id) || {};
    const rankObj = rankings.find(
      (x) => x.user_id === parsedUserId && x.player_id === r.player_id
    );
    return {
      ...r,
      playerName: p.name,
      team: p.team,
      position: p.position,
      ranking: rankObj?.rank ?? null
    };
  });

  let filtered = enriched;
  if (filterTeam) filtered = filtered.filter((r) => r.team === filterTeam);
  if (filterPosition) filtered = filtered.filter((r) => r.position === filterPosition);

  filtered.sort((a, b) => {
    if (sortType === 'team') return a.team.localeCompare(b.team);
    if (sortType === 'position') return a.position.localeCompare(b.position);
    return (a.ranking ?? Infinity) - (b.ranking ?? Infinity);
  });

  const getItemSize = (index) => {
    const baseHeight = expandedReviewIds.includes(filtered[index].id)
      ? rowHeights[index] ?? defaultCollapsedHeight
      : defaultCollapsedHeight;
    return baseHeight + ROW_GAP; // add spacing between rows
  };

  return (
    <div className="profile-container">
      <div className="container">
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
              handleFilterByTeam={(team) => { setFilterTeam(team); setFilterPosition(''); setExpandedReviewIds([]); }}
              handleFilterByPosition={(pos) => { setFilterPosition(pos); setFilterTeam(''); setExpandedReviewIds([]); }}
              handleSortChange={(e) => { setSortType(e.target.value); setExpandedReviewIds([]); }}
              handleClearFilters={() => { setFilterTeam(''); setFilterPosition(''); setSortType('ranking'); setExpandedReviewIds([]); }}
            />

            <div className="reviews-list">
              {filtered.length > 0 ? (
                isMobile ? (
                  filtered.map((review, idx) => (
                    <ReviewRow
                      key={review.id}
                      review={review}
                      index={idx}
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
