import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPlayers } from '../redux/slices/playerSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';
import { getComparisonStats } from '../utils/playerComparison';
import { summarizePlayerRankings } from '../utils/rankingUtils';
import '../style/PlayerComparisonStyle.css';

const statFormatter = new Intl.NumberFormat('en-US');
const formatStat = value => value === null ? 'N/A' : statFormatter.format(value);
const formatAverage = player => player.average_rank === null ? 'N/A' : player.average_rank.toFixed(2);

function PlayerComparison() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { players, status: playerStatus } = useSelector(state => state.player);
  const { rankings, status: rankingStatus } = useSelector(state => state.ranking);

  const loadComparison = useCallback(() => {
    dispatch(fetchPlayers());
    dispatch(fetchRankings());
  }, [dispatch]);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  const byPosition = new Map();
  for (const player of players) {
    const positionPlayers = byPosition.get(player.position) ?? [];
    positionPlayers.push(player);
    byPosition.set(player.position, positionPlayers);
  }

  const positions = [...byPosition.keys()].filter(position => byPosition.get(position).length >= 2);
  const requestedPosition = searchParams.get('position');
  const position = positions.includes(requestedPosition) ? requestedPosition : '';
  const candidates = [...(byPosition.get(position) ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const first = candidates.find(player => String(player.id) === searchParams.get('first'));
  const second = candidates.find(player => player.id !== first?.id && String(player.id) === searchParams.get('second'));
  const [firstSummary, secondSummary] = first && second
    ? summarizePlayerRankings([first, second], rankings)
    : [];
  const stats = first && second ? getComparisonStats(first, second) : [];

  const loading = [playerStatus, rankingStatus].some(status => status === 'idle' || status === 'loading');
  const failed = playerStatus === 'failed' || rankingStatus === 'failed';

  function selectPlayers(firstId, secondId) {
    const selection = { position };
    if (firstId) selection.first = firstId;
    if (secondId) selection.second = secondId;
    setSearchParams(selection, { replace: true });
  }

  return (
    <main className="player-comparison-page container">
      <Link className="comparison-back" to="/players">Back to players</Link>
      <h1>Compare Players</h1>
      <p className="comparison-intro">Compare sample stats and community rankings for two players at the same position.</p>

      {loading ? (
        <p role="status">Loading comparison data…</p>
      ) : failed ? (
        <div className="comparison-error">
          <p role="alert">Could not load comparison data.</p>
          <button type="button" onClick={loadComparison}>Try again</button>
        </div>
      ) : positions.length === 0 ? (
        <p>There are no players at the same position to compare yet.</p>
      ) : (
        <div className="comparison-controls">
          <label>
            Position
            <select
              value={position}
              onChange={event => setSearchParams({ position: event.target.value }, { replace: true })}
            >
              <option value="">Choose a position</option>
              {positions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            First player
            <select
              disabled={!position}
              value={first?.id ?? ''}
              onChange={event => selectPlayers(event.target.value, second?.id)}
            >
              <option value="">Choose a player</option>
              {candidates.filter(player => player.id !== second?.id).map(player => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </label>
          <label>
            Second player
            <select
              disabled={!position}
              value={second?.id ?? ''}
              onChange={event => selectPlayers(first?.id, event.target.value)}
            >
              <option value="">Choose a player</option>
              {candidates.filter(player => player.id !== first?.id).map(player => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {!loading && !failed && firstSummary && secondSummary && (
        <>
          <div className="comparison-results">
            <table aria-label="Player comparison">
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col"><Link to={`/players/${first.id}`}>{first.name}</Link></th>
                  <th scope="col"><Link to={`/players/${second.id}`}>{second.name}</Link></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Team</th>
                  <td>{first.team}</td>
                  <td>{second.team}</td>
                </tr>
                <tr>
                  <th scope="row">Community average rank</th>
                  <td>{formatAverage(firstSummary)}</td>
                  <td>{formatAverage(secondSummary)}</td>
                </tr>
                <tr>
                  <th scope="row">Votes</th>
                  <td>{firstSummary.vote_count}</td>
                  <td>{secondSummary.vote_count}</td>
                </tr>
                {stats.map(({ label, firstValue, secondValue }) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{formatStat(firstValue)}</td>
                    <td>{formatStat(secondValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stats.length === 0 && <p className="comparison-note">Sample stats are unavailable for these players.</p>}
        </>
      )}
    </main>
  );
}

export default PlayerComparison;
