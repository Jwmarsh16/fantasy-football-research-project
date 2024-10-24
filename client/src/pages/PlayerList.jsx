// PlayerList.jsx - Updated to use Axios and Redux for fetching player data
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../slices/playerSlice';
import { Link } from 'react-router-dom';

function PlayerList() {
  const dispatch = useDispatch();
  const players = useSelector((state) => state.player.players);
  const status = useSelector((state) => state.player.status);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPlayers());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error loading players.</div>;
  }

  return (
    <div>
      <h2>Player List</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            <Link to={`/players/${player.id}`}>{player.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;