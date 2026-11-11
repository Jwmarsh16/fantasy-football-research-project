// src/components/profile/MyTeam.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoster } from '../../redux/slices/teamSlice';
import '../../style/MyTeam.css';

function MyTeam({ userId }) {
  const dispatch = useDispatch();

  // Select roster state from Redux
  const { roster, status, error } = useSelector(state => state.team);

  // Fetch roster on mount or when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(fetchRoster(userId));
    }
  }, [dispatch, userId]);

  if (status === 'loading') {
    return <p className="myteam-message" role="status">Loading your team...</p>;
  }

  if (status === 'failed') {
    // Handle error object safely
    const msg =
      typeof error === 'string'
        ? error
        : error?.message || JSON.stringify(error);
    return <p className="myteam-message myteam-error" role="alert">Error: {msg}</p>;
  }

  const groups = [
    {
      name: 'Starters',
      headingId: 'myteam-starters',
      entries: roster.filter(entry => entry.is_starter),
      emptyMessage: 'No starters selected',
    },
    {
      name: 'Bench',
      headingId: 'myteam-bench',
      entries: roster.filter(entry => !entry.is_starter),
      emptyMessage: 'No bench players',
    },
  ];

  return (
    <div className="myteam-container">
      {groups.map(({ name, headingId, entries, emptyMessage }) => (
        <section key={headingId}>
          <h4 id={headingId} className="myteam-section-title">{name} ({entries.length})</h4>
          {entries.length ? (
            <table className="myteam-table" aria-labelledby={headingId}>
              <thead>
                <tr>
                  <th scope="col">Slot</th>
                  <th scope="col">Player</th>
                  <th scope="col">Avg rank</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(({ id, slot, player }) => (
                  <tr key={id}>
                    <td>{slot}</td>
                    <th scope="row">
                      <span className="myteam-player-name">{player.name}</span>
                      <span className="myteam-player-meta">{player.position} · {player.team}</span>
                    </th>
                    <td>{Number.isFinite(player.average_rank) ? player.average_rank.toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="myteam-message">{emptyMessage}</p>
          )}
        </section>
      ))}
    </div>
  );
}

export default MyTeam;
