// src/pages/Profile.jsx
import React, {
  useEffect,
  useState,               // track activeTab
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
  const [activeTab, setActiveTab] = useState('myteam'); // start on My Team tab

  const parsedUserId = userId ? parseInt(userId, 10) : null;
  const listRef = useRef(null);

  const defaultCollapsedHeight = 150;
  const ROW_GAP = 16; // match var(--space-4)

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
        .catch((err) => console.error(err));
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

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [expandedReviewIds]);

  // Prepare data for Reviews tab
  const userReviews = reviews.filter((r) => r.user_id === parsedUserId);
  const teams = [...new Set(userReviews.map((r) => {
    const p = players.find((pl) => pl.id === r.player_id);
    return p?.team;
  }).filter(Boolean))];
  const positions = [...new Set(players.map((p) => p.position))];
  const enrichedReviews = userReviews.map((r) => {
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
  let filtered = enrichedReviews;
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
    return baseHeight + ROW_GAP;
  };

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-page profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
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
          </aside>

          {/* Main content */}
          <main className="profile-main">
            <div className="profile-header">
              <h2 className="profile-title">User Profile</h2>
            </div>

            {/* Tab navigation */}
            <div className="profile-tabs">
              <button
                className={`profile-tab-button ${activeTab === 'myteam' ? 'active' : ''}`}
                onClick={() => setActiveTab('myteam')}
              >
                My Team
              </button>
              <button
                className={`profile-tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
              <button
                className={`profile-tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('watchlist')}
              >
                Watchlist
              </button>
              <button
                className={`profile-tab-button ${activeTab === 'comparisons' ? 'active' : ''}`}
                onClick={() => setActiveTab('comparisons')}
              >
                Player Comparisons
              </button>
              <button
                className={`profile-tab-button ${activeTab === 'groups' ? 'active' : ''}`}
                onClick={() => setActiveTab('groups')}
              >
                Groups &amp; Leagues
              </button>
              <button
                className={`profile-tab-button ${activeTab === 'video' ? 'active' : ''}`}
                onClick={() => setActiveTab('video')}
              >
                Video Hub
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'myteam' && (
              <div className="myteam-section">
                <h3 className="section-title">My Team</h3>
                {/* TODO: Replace with MyTeam component */}
                <p>Your roster overview goes here.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-rankings-section">
                <h3 className="section-title">Your Reviews</h3>
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
                      No reviews available.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="watchlist-section">
                <h3 className="section-title">Watchlist</h3>
                {/* TODO: Replace with Watchlist component */}
                <p>Your tracked players go here.</p>
              </div>
            )}

            {activeTab === 'comparisons' && (
              <div className="comparisons-section">
                <h3 className="section-title">Player Comparisons</h3>
                {/* TODO: Replace with Comparisons component */}
                <p>Comparison tool goes here.</p>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="groups-section">
                <h3 className="section-title">Groups &amp; Leagues</h3>
                {/* TODO: Replace with Groups & Leagues component */}
                <p>Your group and league links go here.</p>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="video-section">
                <h3 className="section-title">Video Hub</h3>
                {/* TODO: Replace with Video Hub component */}
                <p>Embedded videos or bookmarks go here.</p>
              </div>
            )}
          </main>
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
