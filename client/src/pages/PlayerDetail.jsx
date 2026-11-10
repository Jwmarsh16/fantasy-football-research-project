import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchPlayer, fetchPlayers } from '../redux/slices/playerSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import { addRanking, deleteRanking, fetchRankings } from '../redux/slices/rankingSlice';
import { addReview, fetchReviews } from '../redux/slices/reviewSlice';

import PlayerInfoCard from '../components/player/PlayerInfoCard';
import RankingReviewForm from '../components/player/RankingReviewForm';
import SortDropdown from '../components/player/SortDropdown';
import ReviewRankingList from '../components/player/ReviewRankingList';

import '../style/PlayerDetailStyle.css';

const getPlayerHeadshot = (playerName) => {
  const formattedName = playerName.toLowerCase().replace(/ /g, '_');
  return `/images/players/${formattedName}.png`;
};

const formatStatKey = (key) =>
  key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

function PlayerDetail() {
  const { id } = useParams();
  const playerId = Number(id);
  const dispatch = useDispatch();

  const player = useSelector(state => state.player.currentPlayer);
  const playerStatus = useSelector(state => state.player.playerStatus);
  const maxRank = useSelector(state => state.player.players.length);
  const rankings = useSelector(state => state.ranking.rankings);
  const rankingsStatus = useSelector(state => state.ranking.status);
  const reviews = useSelector(state => state.review.reviews);
  const users = useSelector(state => state.user.users);
  const currentUser = useSelector(state => state.auth.currentUser);

  const [sortOrder, setSortOrder] = useState('asc');
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  useEffect(() => {
    dispatch(fetchPlayer(playerId));
  }, [dispatch, playerId]);

  useEffect(() => {
    dispatch(fetchPlayers());
    dispatch(fetchRankings());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSaveRank = async (rank) => {
    await dispatch(addRanking({ rank, player_id: playerId })).unwrap();
    dispatch(fetchPlayer(playerId));
  };

  const handleRemoveRank = async (rankingId) => {
    await dispatch(deleteRanking(rankingId)).unwrap();
    dispatch(fetchPlayer(playerId));
  };

  const handlePostReview = async (content) => {
    await dispatch(addReview({ content, player_id: playerId })).unwrap();
  };

  const handleToggleReviews = async () => {
    if (showReviews) {
      setShowReviews(false);
      return;
    }

    setReviewsError(null);
    try {
      await dispatch(fetchReviews()).unwrap();
      setShowReviews(true);
    } catch {
      setReviewsError('Could not load reviews. Please try again.');
    }
  };

  if (player?.id !== playerId) {
    return playerStatus === 'failed'
      ? <p className="error-message">Could not load this player.</p>
      : <p className="loading-message">Loading...</p>;
  }

  const playerRanks = new Map(
    rankings.filter(rank => rank.player_id === playerId).map(rank => [rank.user_id, rank])
  );
  const savedRanking = playerRanks.get(currentUser?.id);
  const sortedReviews = reviews
    .filter(review => review.player_id === playerId)
    .map(review => ({ ...review, rank: playerRanks.get(review.user_id)?.rank ?? null }))
    .sort((a, b) => {
      const aRank = a.rank ?? Infinity;
      const bRank = b.rank ?? Infinity;
      return sortOrder === 'asc' ? aRank - bRank : bRank - aRank;
    });

  return (
    <div className="player-detail-page container">
      <div className="player-detail-container">
        <PlayerInfoCard
          player={player}
          getPlayerHeadshot={getPlayerHeadshot}
          formatStatKey={formatStatKey}
        />

        <RankingReviewForm
          key={playerId}
          maxRank={maxRank}
          rankReady={maxRank > 0 && rankingsStatus !== 'idle' && rankingsStatus !== 'loading'}
          signedIn={Boolean(currentUser)}
          savedRank={savedRanking?.rank}
          onSaveRank={handleSaveRank}
          onRemoveRank={() => handleRemoveRank(savedRanking.id)}
          onPostReview={handlePostReview}
        />

        <div className="toggle-reviews-section">
          <button className="toggle-button" onClick={handleToggleReviews}>
            {showReviews ? 'Hide Reviews and Rankings' : 'Show Reviews and Rankings'}
          </button>
          {reviewsError && <p className="error-message" role="alert">{reviewsError}</p>}
        </div>

        {showReviews && (
          <>
            <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
            <ReviewRankingList
              sortedReviews={sortedReviews}
              getUsernameById={uid => users.find(user => user.id === uid)?.username ?? 'Unknown'}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default PlayerDetail;
