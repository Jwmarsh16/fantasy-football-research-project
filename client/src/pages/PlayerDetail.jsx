import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchPlayer, fetchPlayers } from '../redux/slices/playerSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import { addRanking, deleteRanking, fetchRankings } from '../redux/slices/rankingSlice';
import { addReview, fetchReviews } from '../redux/slices/reviewSlice';

import PlayerInfoCard from '../components/player/PlayerInfoCard';
import RankingReviewForm, { PlayerReviewForm } from '../components/player/RankingReviewForm';
import SortDropdown from '../components/player/SortDropdown';
import ReviewRankingList from '../components/player/ReviewRankingList';
import { teamColors } from '../constants/teamColors';

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
  const { state } = useLocation();
  const playerId = Number(id);
  const dispatch = useDispatch();

  const player = useSelector(state => state.player.currentPlayer);
  const playerStatus = useSelector(state => state.player.playerStatus);
  const players = useSelector(state => state.player.players);
  const rankings = useSelector(state => state.ranking.rankings);
  const rankingsStatus = useSelector(state => state.ranking.status);
  const reviews = useSelector(state => state.review.reviews);
  const users = useSelector(state => state.user.users);
  const currentUser = useSelector(state => state.auth.currentUser);
  const playerReady = player?.id === playerId;

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

  useLayoutEffect(() => {
    if (!playerReady) return;
    if (window.location.hash === '#rank-player') {
      document.getElementById('rank-player')?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [playerId, playerReady]);

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

  if (!playerReady) {
    return playerStatus === 'failed'
      ? <p className="error-message">Could not load this player.</p>
      : <p className="loading-message">Loading...</p>;
  }

  const playerRanks = new Map(
    rankings.filter(rank => rank.player_id === playerId).map(rank => [rank.user_id, rank])
  );
  const savedRanking = playerRanks.get(currentUser?.id);
  const canCompare = players.some(candidate => candidate.id !== playerId && candidate.position === player.position);
  const compareSearch = new URLSearchParams({ position: player.position, first: playerId });
  const initials = player.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('');
  const sortedReviews = reviews
    .filter(review => review.player_id === playerId)
    .map(review => ({ ...review, rank: playerRanks.get(review.user_id)?.rank ?? null }))
    .sort((a, b) => {
      const aRank = a.rank ?? Infinity;
      const bRank = b.rank ?? Infinity;
      return sortOrder === 'asc' ? aRank - bRank : bRank - aRank;
    });

  return (
    <main className="player-detail-page container">
      <div className="player-detail-container">
        <Link className="player-detail-back" to={{ pathname: '/players', search: state?.catalogSearch ?? '' }}>
          Back to players
        </Link>
        <header className="player-detail-header" style={{ '--player-accent': teamColors[player.team] || 'var(--color-primary)' }}>
          <div className="player-detail-identity">
            <div className="player-detail-avatar" aria-hidden="true">
              <span>{initials}</span>
              <img
                key={player.id}
                src={getPlayerHeadshot(player.name)}
                alt=""
                onError={event => { event.currentTarget.hidden = true; }}
              />
            </div>
            <div>
              <h1>{player.name}</h1>
              <p>{player.position} · {player.team}</p>
            </div>
          </div>
          <p className="player-detail-community">
            Community average rank
            <strong>{Number.isFinite(player.average_rank) ? player.average_rank.toFixed(2) : 'N/A'}</strong>
          </p>
          <div className="player-detail-actions">
            {currentUser ? (
              <a href="#rank-player" className="ffrh-button">Rank Player</a>
            ) : (
              <Link to="/login" state={{ playerId }} className="ffrh-button">Rank Player</Link>
            )}
            {canCompare && (
              <Link to={`/players/compare?${compareSearch}`} className="ffrh-button ffrh-button--secondary">
                Compare this player
              </Link>
            )}
          </div>
          <p className="player-detail-data-note">
            <strong>Sample data</strong>. Player details and stats are for this demo.
          </p>
        </header>

        <RankingReviewForm
          key={playerId}
          maxRank={players.length}
          rankReady={players.length > 0 && rankingsStatus !== 'idle' && rankingsStatus !== 'loading'}
          savedRank={savedRanking?.rank}
          onSaveRank={handleSaveRank}
          onRemoveRank={() => handleRemoveRank(savedRanking.id)}
        />

        <PlayerInfoCard player={player} formatStatKey={formatStatKey} />

        {currentUser && <PlayerReviewForm key={`review-${playerId}`} onPostReview={handlePostReview} />}

        <div className="toggle-reviews-section">
          <button
            type="button"
            className="ffrh-button ffrh-button--secondary"
            aria-expanded={showReviews}
            onClick={handleToggleReviews}
          >
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
    </main>
  );
}

export default PlayerDetail;
