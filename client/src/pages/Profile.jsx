// src/pages/Profile.jsx
import {
  useEffect,
  useLayoutEffect,
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

const DEFAULT_REVIEW_HEIGHT = 144;
const REVIEW_ROW_GAP = 8; // var(--space-2)
const VIRTUAL_LIST_HEIGHT = 600;

function VirtualReviewRow({ data, index, style }) {
  return <div style={style}>{data.renderReview(data.reviews[index], data.updateRowHeight)}</div>;
}

function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const userDetails = useSelector((state) => state.user.userDetails);
  const [profileError, setProfileError] = useState(false);
  const { reviews, status: reviewsStatus } = useSelector((state) => state.review);
  const rankings = useSelector((state) => state.ranking.rankings);
  const { players, status: playersStatus } = useSelector((state) => state.player);

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

  const updateRowHeight = useCallback((reviewId, height) => {
    setRowHeights((prev) => {
      const current = prev[reviewId];
      if (current !== undefined && Math.abs(current - height) < 1) return prev;
      return { ...prev, [reviewId]: height };
    });
  }, []);

  useLayoutEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [reviews, players, rankings, filterTeam, filterPosition, sortType, rowHeights]);

  // Prepare data for Reviews tab
  const userReviews = reviews.filter((r) => r.user_id === parsedUserId);
  const positions = [...new Set(players.map((p) => p.position))];
  const enrichedReviews = userReviews.map((r) => {
    const p = players.find((p) => p.id === r.player_id) || {};
    const rankObj = rankings.find(
      (x) => x.user_id === parsedUserId && x.player_id === r.player_id
    );
    return {
      ...r,
      playerName: p.name ?? 'Unknown player',
      team: p.team ?? '',
      position: p.position ?? '',
      ranking: rankObj?.rank ?? null,
    };
  });
  const teams = [...new Set([filterTeam, ...enrichedReviews.map((r) => r.team)].filter(Boolean))].sort();
  const filtered = enrichedReviews.filter((review) => (
    (!filterTeam || review.team === filterTeam)
    && (!filterPosition || review.position === filterPosition)
  ));
  filtered.sort((a, b) => {
    if (sortType === 'team') return a.team.localeCompare(b.team);
    if (sortType === 'position') return a.position.localeCompare(b.position);
    return (a.ranking ?? Infinity) - (b.ranking ?? Infinity);
  });

  const renderReview = (review, measureHeight) => (
    <ReviewRow
      key={review.id}
      review={review}
      isExpanded={expandedReviewIds.includes(review.id)}
      ownsProfile={ownsProfile}
      openMenuReviewId={openMenuReviewId}
      setOpenMenuReviewId={setOpenMenuReviewId}
      setEditingReview={setEditingReview}
      handleDeleteReview={handleDeleteReview}
      toggleReviewExpansion={toggleReviewExpansion}
      updateRowHeight={measureHeight}
    />
  );

  const useVirtualList = !isMobile && filtered.length > Math.floor(VIRTUAL_LIST_HEIGHT / DEFAULT_REVIEW_HEIGHT);
  const reviewsFailed = reviewsStatus === 'failed' || playersStatus === 'failed';
  const reviewsLoading = [reviewsStatus, playersStatus].some((status) => status === 'idle' || status === 'loading');
  let reviewsMessage = `${filtered.length} of ${enrichedReviews.length} reviews`;
  if (reviewsFailed) reviewsMessage = 'Could not load reviews.';
  else if (reviewsLoading) reviewsMessage = 'Loading reviews…';
  else if (!enrichedReviews.length) reviewsMessage = 'No reviews yet.';
  else if (!filtered.length) reviewsMessage = 'No reviews match these filters.';

  if (!parsedUserId || userDetails?.id !== parsedUserId) {
    return profileError
      ? <p className="error-message">Could not load this profile.</p>
      : <p className="loading-message">Loading profile...</p>;
  }

  const avatarUrl =
    userDetails.profilePic?.trim() === 'avatar'
      ? `https://i.pravatar.cc/150?u=${userDetails.id}`
      : userDetails.profilePic?.trim();

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-page profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="user-info">
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
              <ProfileMenu
                currentUser={currentUser}
                parsedUserId={parsedUserId}
                showMenu={showMenu}
                setShowMenu={setShowMenu}
                handleDeleteProfile={handleDeleteProfile}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="profile-main">
            <div className="profile-header">
              <h1 className="profile-title">Profile</h1>
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
              <section className="myteam-section" aria-labelledby="myteam-title">
                <h3 id="myteam-title" className="section-title">My Team</h3>
                <MyTeam userId={parsedUserId} />
              </section>
            )}

            {activeTab === 'rankings' && <MyRankings />}

            {activeTab === 'reviews' && (
              <section className="profile-reviews" aria-labelledby="profile-reviews-title">
                <h2 id="profile-reviews-title" className="section-title">
                  {ownsProfile ? 'Your Reviews' : `Reviews by ${userDetails.username}`}
                </h2>
                <ReviewFilterSort
                  teams={teams}
                  positions={positions}
                  sortType={sortType}
                  filterTeam={filterTeam}
                  filterPosition={filterPosition}
                  handleFilterByTeam={(event) => {
                    setFilterTeam(event.target.value);
                  }}
                  handleFilterByPosition={(position) => {
                    setFilterPosition((current) => current === position ? '' : position);
                  }}
                  handleSortChange={(event) => {
                    setSortType(event.target.value);
                  }}
                  handleClearFilters={() => {
                    setFilterTeam('');
                    setFilterPosition('');
                    setSortType('ranking');
                    setExpandedReviewIds([]);
                  }}
                />
                <p className="profile-reviews-status" role={reviewsFailed ? 'alert' : 'status'}>{reviewsMessage}</p>
                {filtered.length > 0 && (
                  <div className="profile-reviews-list">
                    {useVirtualList ? (
                      <List
                        ref={listRef}
                        height={VIRTUAL_LIST_HEIGHT}
                        itemCount={filtered.length}
                        itemData={{ reviews: filtered, renderReview, updateRowHeight }}
                        itemKey={(index, data) => data.reviews[index].id}
                        itemSize={(index) => (rowHeights[filtered[index].id] ?? DEFAULT_REVIEW_HEIGHT) + REVIEW_ROW_GAP}
                        width="100%"
                      >
                        {VirtualReviewRow}
                      </List>
                    ) : (
                      filtered.map((review) => renderReview(review))
                    )}
                  </div>
                )}
              </section>
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
