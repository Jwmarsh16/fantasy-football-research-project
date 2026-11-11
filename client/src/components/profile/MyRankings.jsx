import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPlayers } from '../../redux/slices/playerSlice';
import { fetchRankings } from '../../redux/slices/rankingSlice';
import { getPersonalRankedPlayers, summarizePlayerRankings } from '../../utils/rankingUtils';

function MyRankings() {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth.currentUser?.id);
  const { players, status: playersStatus } = useSelector(state => state.player);
  const { rankings, status: rankingsStatus } = useSelector(state => state.ranking);

  let content;
  if (playersStatus === 'failed' || rankingsStatus === 'failed') {
    content = (
      <div>
        <p role="alert">Could not load your rankings.</p>
        <button type="button" className="ffrh-button ffrh-button--secondary" onClick={() => {
          dispatch(fetchPlayers());
          dispatch(fetchRankings());
        }}>
          Try again
        </button>
      </div>
    );
  } else if (playersStatus !== 'succeeded' || rankingsStatus !== 'succeeded') {
    content = <p role="status">Loading your rankings…</p>;
  } else {
    const rankedPlayers = getPersonalRankedPlayers(summarizePlayerRankings(players, rankings), rankings, userId);
    content = rankedPlayers.length ? (
      <>
        <p className="rankings-note">Open a player to edit your rank. Community averages include sample rankings.</p>
        <table className="rankings-table">
          <thead>
            <tr>
              <th scope="col">Player</th>
              <th scope="col">Your rank</th>
              <th scope="col">Community average</th>
            </tr>
          </thead>
          <tbody>
            {rankedPlayers.map(player => (
              <tr key={player.id}>
                <th scope="row">
                  <Link to={`/players/${player.id}`}>{player.name}</Link>
                  <span className="rankings-player-info">{player.position} · {player.team}</span>
                </th>
                <td>{player.personal_rank}</td>
                <td>{player.average_rank?.toFixed(2) ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ) : (
      <p>You haven’t ranked any players yet. <Link to="/players">Browse Players</Link> to save a rank.</p>
    );
  }

  return (
    <section className="rankings-section" aria-labelledby="my-rankings-title">
      <h3 id="my-rankings-title" className="section-title">My Rankings</h3>
      {content}
    </section>
  );
}

export default MyRankings;
