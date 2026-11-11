import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPlayers } from '../../redux/slices/playerSlice';
import { fetchRankings } from '../../redux/slices/rankingSlice';
import { getCommunityTopRankedPlayers, getPersonalTopRankedPlayers } from '../../utils/rankingUtils';
import '../../style/RankingSidebar.css';

function RankingSidebar() {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.currentUser?.id);
  const { players, status: playerStatus } = useSelector(state => state.player);
  const { rankings, status: rankingStatus } = useSelector(state => state.ranking);
  const [showPersonal, setShowPersonal] = useState(false);

  const loadRankings = useCallback(() => {
    dispatch(fetchPlayers());
    dispatch(fetchRankings());
  }, [dispatch]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  const showingPersonal = Boolean(userId) && showPersonal;
  const failed = playerStatus === 'failed' || rankingStatus === 'failed';
  const loading = [playerStatus, rankingStatus].some(status => status === 'idle' || status === 'loading');
  const topPlayers = showingPersonal
    ? getPersonalTopRankedPlayers(players, rankings, userId)
    : getCommunityTopRankedPlayers(players, rankings);

  return (
    <section className="ranking-sidebar" aria-labelledby="home-rankings-title">
      <div className="ranking-header">
        <h2 id="home-rankings-title" className="ranking-title">
          {showingPersonal ? 'Your Top 5' : 'Community Top 5'}
        </h2>
        {userId && (
          <button type="button" className="ranking-toggle" onClick={() => setShowPersonal(value => !value)}>
            {showingPersonal ? 'Show Community Top 5' : 'Show Your Top 5'}
          </button>
        )}
      </div>
      {!showingPersonal && <p className="ranking-note">Includes sample rankings.</p>}

      {loading ? (
        <p className="ranking-state" role="status">Loading rankings…</p>
      ) : failed ? (
        <div className="ranking-state">
          <p role="alert">Could not load rankings.</p>
          <button type="button" className="ranking-toggle" onClick={loadRankings}>Try again</button>
        </div>
      ) : topPlayers.length === 0 ? (
        <p className="ranking-state">{showingPersonal ? 'You haven’t ranked any players yet.' : 'No rankings yet.'}</p>
      ) : (
        <ol className="ranking-list" role="list">
          {topPlayers.map(player => (
            <li key={player.id} className="ranking-item">
              <div>
                <Link to={`/players/${player.id}`} className="ranking-player-link">{player.name}</Link>
                <p className="ranking-meta">{player.position} · {player.team}</p>
              </div>
              <div className="ranking-score">
                {showingPersonal ? (
                  <strong>Rank {player.personal_rank}</strong>
                ) : (
                  <>
                    <strong>Avg rank {player.average_rank.toFixed(2)}</strong>
                    <p className="ranking-meta">{player.vote_count} {player.vote_count === 1 ? 'vote' : 'votes'}</p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {showingPersonal && (
        <p className="ranking-state">
          <Link to={`/profile/${userId}?tab=rankings`} className="ranking-player-link">My Rankings</Link>
        </p>
      )}
    </section>
  );
}

export default RankingSidebar;
