import React, { useState, useEffect } from 'react';
import { getPlayers } from './api';
import { Link } from 'react-router-dom';

function PlayerList() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getPlayers();
      setPlayers(data);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Player List</h1>
      <ul>
        {players.map(player => (
          <li key={player.id}>
            <Link to={`/players/${player.id}`}>{player.name} (ID: {player.id})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;
