// src/components/profile/MyTeam.jsx
import React, { useEffect } from 'react';
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
    return <p className="myteam-loading">Loading your team...</p>;
  }

  if (status === 'failed') {
    // Handle error object safely
    const msg =
      typeof error === 'string'
        ? error
        : error?.message || JSON.stringify(error);
    return <p className="myteam-error">Error: {msg}</p>;
  }

  // Split starters vs bench
  const starters = roster.filter(entry => entry.is_starter);
  const bench = roster.filter(entry => !entry.is_starter);

  return (
    <div className="myteam-container">
      <h4 className="myteam-section-title">Starters ({starters.length})</h4>
      <table className="myteam-table">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Player</th>
            <th>Position</th>
            <th>Team</th>
            <th>Avg Rank</th>
          </tr>
        </thead>
        <tbody>
          {starters.length > 0 ? (
            starters.map(r => (
              <tr key={r.id}>
                <td>{r.slot}</td>
                <td>{r.player.name}</td>
                <td>{r.player.position}</td>
                <td>{r.player.team}</td>
                <td>{r.player.average_rank ?? '—'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                No starters selected
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h4 className="myteam-section-title">Bench ({bench.length})</h4>
      <table className="myteam-table">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Player</th>
            <th>Position</th>
            <th>Team</th>
            <th>Avg Rank</th>
          </tr>
        </thead>
        <tbody>
          {bench.length > 0 ? (
            bench.map(r => (
              <tr key={r.id}>
                <td>{r.slot}</td>
                <td>{r.player.name}</td>
                <td>{r.player.position}</td>
                <td>{r.player.team}</td>
                <td>{r.player.average_rank ?? '—'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                No bench players
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MyTeam;
