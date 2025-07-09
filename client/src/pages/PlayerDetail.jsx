// src/pages/PlayerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  setReviews,
  setMaxRank,
  fetchPlayer,
  fetchPlayers
} from '../redux/slices/playerSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import {
  addRanking,
  fetchRankings,
  updateRanking
} from '../redux/slices/rankingSlice';
import {
  addReview,
  fetchReviews,      // using thunk instead of axios
  updateReview
} from '../redux/slices/reviewSlice';

import PlayerInfoCard from '../components/player/PlayerInfoCard';
import RankingReviewForm from '../components/player/RankingReviewForm';
import SortDropdown from '../components/player/SortDropdown';
import ReviewRankingList from '../components/player/ReviewRankingList';
import EditReviewModal from '../components/profile/EditReviewModal';

import '../style/PlayerDetailStyle.css';

const getPlayerHeadshot = (playerName) => {
  const formattedName = playerName.toLowerCase().replace(/ /g, "_");
  return `/images/players/${formattedName}.png`;
};

const formatStatKey = (key) =>
  key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

function PlayerDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const player = useSelector(state => state.player.currentPlayer);
  const reviews = useSelector(state => state.player.reviews);
  const rankings = useSelector(state => state.ranking.rankings);
  const maxRank = useSelector(state => state.player.maxRank);
  const users = useSelector(state => state.user.users);
  const currentUser = useSelector(state => state.auth.currentUser);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const [sortOrder, setSortOrder] = useState('asc');
  const [showReviews, setShowReviews] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        await dispatch(fetchPlayer(id)).unwrap();
        const all = await dispatch(fetchPlayers()).unwrap();
        dispatch(setMaxRank(all.length));
        if (!users.length) {
          dispatch(fetchUsers());
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to fetch player data.');
      }
    }
    loadData();
  }, [id, dispatch, users.length]);

  const handleCombinedSubmit = async (values, { resetForm }) => {
    if (!isAuthenticated || !currentUser) {
      setError('You must be logged in to add a ranking and review.');
      return;
    }
    try {
      await dispatch(addRanking({
        rank: values.rank,
        player_id: parseInt(id, 10),
        user_id: currentUser.id,
      })).unwrap();
      await dispatch(addReview({
        content: values.content,
        player_id: parseInt(id, 10),
        user_id: currentUser.id,
      })).unwrap();

      setSuccess('Ranking and review added successfully!');
      resetForm();

      await dispatch(fetchRankings()).unwrap();
      // fetchReviews now replaces axios call
      const allReviews = await dispatch(fetchReviews()).unwrap();
      const playerReviews = allReviews.filter(
        rev => rev.player_id === parseInt(id, 10)
      );
      dispatch(setReviews(playerReviews));

      await dispatch(fetchPlayer(id)).unwrap();
    } catch (err) {
      console.error('Failed to add ranking and review:', err);
      setError('Failed to add ranking and review.');
    }
  };

  const handleToggleReviews = async () => {
    if (!showReviews) {
      try {
        // use thunk instead of axios
        const allReviews = await dispatch(fetchReviews()).unwrap();
        const playerReviews = allReviews.filter(
          rev => rev.player_id === parseInt(id, 10)
        );
        dispatch(setReviews(playerReviews));
        await dispatch(fetchRankings()).unwrap();
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to fetch reviews.');
      }
    }
    setShowReviews(!showReviews);
  };

  const combined = reviews
    .filter(r => r.player_id === parseInt(id, 10))
    .map(rev => ({
      ...rev,
      rank: (rankings.find(
        rk => rk.player_id === rev.player_id && rk.user_id === rev.user_id
      ) || {}).rank ?? null,
      ranking_id: (rankings.find(
        rk => rk.player_id === rev.player_id && rk.user_id === rev.user_id
      ) || {}).id ?? null,
      playerName: player?.name
    }));
  const sortedReviews = [...combined].sort((a, b) => {
    const aRank = a.rank !== null ? a.rank : Infinity;
    const bRank = b.rank !== null ? b.rank : Infinity;
    return sortOrder === 'asc' ? aRank - bRank : bRank - aRank;
  });

  if (error) return <div className="error-message">{error}</div>;
  if (!player) return <div className="loading-message">Loading...</div>;

  return (
    <div className="player-detail-page container">
      <div className="player-detail-container">
        <PlayerInfoCard
          player={player}
          getPlayerHeadshot={getPlayerHeadshot}
          formatStatKey={formatStatKey}
        />

        <RankingReviewForm
          maxRank={maxRank}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onSubmit={handleCombinedSubmit}
          success={success}
        />

        <div className="toggle-reviews-section">
          <button className="toggle-button" onClick={handleToggleReviews}>
            {showReviews ? 'Hide Reviews and Rankings' : 'Show Reviews and Rankings'}
          </button>
        </div>

        {showReviews && (
          <>
            <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
            <ReviewRankingList
              sortedReviews={sortedReviews}
              setEditingReview={setEditingReview}
              getUsernameById={uid =>
                (users.find(u => u.id === parseInt(uid, 10)) || {}).username || 'Unknown'
              }
            />
          </>
        )}
      </div>

      <EditReviewModal
        editingReview={editingReview}
        setEditingReview={setEditingReview}
        dispatch={dispatch}
        parsedUserId={currentUser?.id}
        updateRanking={updateRanking}
        updateReview={updateReview}
        fetchReviews={fetchReviews}
        fetchRankings={fetchRankings}
      />

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default PlayerDetail;
