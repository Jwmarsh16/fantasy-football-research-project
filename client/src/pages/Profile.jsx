// src/pages/Profile.jsx
import {
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { VariableSizeList as List } from 'react-window';
import {
  fetchUserById,
  setUserDetails,
  fetchUsers
} from '../redux/slices/userSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';
import { fetchPlayers } from '../redux/slices/playerSlice';
import {
  fetchReviews,
  deleteReview,
  updateReview
} from '../redux/slices/reviewSlice';
import { deleteUser } from '../redux/slices/authSlice';
import { fetchRoster } from '../redux/slices/teamSlice'; // added to fetch roster entries

import '../style/ProfileStyle.css';
import UserInfoCard from '../components/profile/UserInfoCard';
import ProfileMenu from '../components/profile/ProfileMenu';
import ReviewFilterSort from '../components/profile/ReviewFilterSort';
import ReviewRow from '../components/profile/ReviewRow';
import EditReviewModal from '../components/profile/EditReviewModal';
import MyTeam from '../components/profile/MyTeam'; // added MyTeam component
import MyRankings from '../components/profile/MyRankings';

function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const userDetails = useSelector((state) => state.user.userDetails);
  const [profileError, setProfileError] = useState(false);
  const reviews = useSelector((state) => state.review.reviews);
  const rankings = useSelector((state) => state.ranking.rankings);
  const players = useSelector((state) => state.player.players);

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
  const ownsProfile = currentUser?.id === parsedUserId;
  const requestedTab = searchParams.get('tab');
  const activeTab = requestedTab === 'reviews' || (requestedTab === 'rankings' && ownsProfile)
    ? requestedTab
    : 'myteam';
  const listRef = useRef(null);

  const defaultCollapsedHeight = 150;
  const ROW_GAP = 16; // match var(--space-4)

  // handle window resize for mobile layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // fetch user data, reviews, rankings, and roster on mount/user change
  useEffect(() => {
    if (!parsedUserId) {
      navigate(currentUser ? `/profile/${currentUser.id}` : '/login', { replace: true });
      return;
    }
    if (!userDetails || userDetails.id !== parsedUserId) {
      setProfileError(false);
      dispatch(fetchUserById(parsedUserId))
        .unwrap()
        .then((res) => res && dispatch(setUserDetails(res)))
        .catch(() => setProfileError(true));
    }
    dispatch(fetchRankings());
    dispatch(fetchReviews());
    dispatch(fetchRoster(parsedUserId)); // fetch roster on mount
  }, [parsedUserId, userDetails, dispatch, navigate, currentUser]);

  useEffect(() => {
    if (parsedUserId) dispatch(fetchPlayers());
  }, [dispatch, parsedUserId]);

  // re-fetch roster when switching back to My Team tab
  useEffect(() => {
    if (activeTab === 'myteam' && parsedUserId) {
      dispatch(fetchRoster(parsedUserId)); // re-fetch roster on tab switch
    }
  }, [activeTab, parsedUserId, dispatch]);

  // force re-render when userDetails updates
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [userDetails]);

  const handleDeleteReview = async (reviewId) => {
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
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
  const teams = [
    ...new Set(
      userReviews
        .map((r) => players.find((pl) => pl.id === r.player_id)?.team)
        .filter(Boolean)
    ),
  ];
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
      ranking: rankObj?.rank ?? null,
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

  if (!parsedUserId || userDetails?.id !== parsedUserId) {
    return profileError
      ? <p className="error-message">Could not load this profile.</p>
      : <p className="loading-message">Loading profile...</p>;
  }

  const avatarUrl =
    userDetails.profilePic?.trim() === 'avatar'
      ? `https://i.pravatar.cc/150?u=${userDetails.id}`
      : userDetails.profilePic?.trim() || 'https://placehold.co/600x400?text=Upload+Picture';

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
                type="button"
                className={`profile-tab-button ${activeTab === 'myteam' ? 'active' : ''}`}
                aria-pressed={activeTab === 'myteam'}
                onClick={() => setSearchParams({}, { replace: true })}
              >
                My Team
              </button>
              {ownsProfile && (
                <button
                  type="button"
                  className={`profile-tab-button ${activeTab === 'rankings' ? 'active' : ''}`}
                  aria-pressed={activeTab === 'rankings'}
                  onClick={() => setSearchParams({ tab: 'rankings' }, { replace: true })}
                >
                  My Rankings
                </button>
              )}
              <button
                type="button"
                className={`profile-tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                aria-pressed={activeTab === 'reviews'}
                onClick={() => setSearchParams({ tab: 'reviews' }, { replace: true })}
              >
                Reviews
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'myteam' && (
              <div className="myteam-section">
                <h3 className="section-title">My Team</h3>
                <MyTeam userId={parsedUserId} />
              </div>
            )}

            {activeTab === 'rankings' && <MyRankings />}

            {activeTab === 'reviews' && (
              <div className="reviews-rankings-section">
                <h3 className="section-title">Your Reviews</h3>
                <ReviewFilterSort
                  teams={teams}
                  positions={positions}
                  sortType={sortType}
                  filterTeam={filterTeam}
                  handleFilterByTeam={(team) => {
                    setFilterTeam(team);
                    setFilterPosition('');
                    setExpandedReviewIds([]);
                  }}
                  handleFilterByPosition={(pos) => {
                    setFilterPosition(pos);
                    setFilterTeam('');
                    setExpandedReviewIds([]);
                  }}
                  handleSortChange={(e) => {
                    setSortType(e.target.value);
                    setExpandedReviewIds([]);
                  }}
                  handleClearFilters={() => {
                    setFilterTeam('');
                    setFilterPosition('');
                    setSortType('ranking');
                    setExpandedReviewIds([]);
                  }}
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
                          handleDeleteReview={handleDeleteReview}
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
                            isExpanded={expandedReviewIds.includes(
                              filtered[index].id
                            )}
                            currentUser={currentUser}
                            parsedUserId={parsedUserId}
                            openMenuReviewId={openMenuReviewId}
                            setOpenMenuReviewId={setOpenMenuReviewId}
                            setEditingReview={setEditingReview}
                            handleDeleteReview={handleDeleteReview}
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

          </main>
        </div>
      </div>

      {editingReview && (
        <EditReviewModal
          editingReview={editingReview}
          setEditingReview={setEditingReview}
          dispatch={dispatch}
          updateReview={updateReview}
          fetchReviews={fetchReviews}
        />
      )}
    </div>
  );
}

export default Profile;
