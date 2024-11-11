// PlayerList.jsx - Updated to use Axios and Redux for fetching player data with appropriate class names for styling, sorting, filtering, and displaying rankings
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../redux/slices/playerSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';
import { Link } from 'react-router-dom';

function PlayerList() {
  const dispatch = useDispatch();
  const players = useSelector((state) => state.player.players);
  const rankings = useSelector((state) => state.ranking.rankings);
  const status = useSelector((state) => state.player.status);
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [sortType, setSortType] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPlayers());
      dispatch(fetchRankings());
    }
  }, [status, dispatch]);

  useEffect(() => {
    // Merge players with rankings to include the average rank
    const playersWithRankings = players.map((player) => {
      const playerRankings = rankings.filter(ranking => ranking.player_id === player.id);
      const averageRank = playerRankings.length > 0
        ? playerRankings.reduce((sum, ranking) => sum + ranking.rank, 0) / playerRankings.length
        : null;
      return { ...player, average_rank: averageRank };
    });

    let filteredPlayers = [...playersWithRankings];
    if (filterTeam) {
      filteredPlayers = filteredPlayers.filter(player => player.team === filterTeam);
    }
    if (filterPosition) {
      filteredPlayers = filteredPlayers.filter(player => player.position === filterPosition);
    }
    let sorted = [...filteredPlayers];
    if (sortType === 'team') {
      sorted.sort((a, b) => a.team.localeCompare(b.team));
    } else if (sortType === 'position') {
      sorted.sort((a, b) => a.position.localeCompare(b.position));
    } else if (sortType === 'ranking') {
      sorted.sort((a, b) => {
        if (a.average_rank === undefined) return 1;
        if (b.average_rank === undefined) return -1;
        return a.average_rank - b.average_rank;
      });
    }
    setSortedPlayers(sorted);
  }, [players, rankings, sortType, filterTeam, filterPosition]);

  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };

  const handleFilterByTeam = (team) => {
    setFilterTeam(team);
    setFilterPosition(''); // Clear position filter when filtering by team
  };

  const handleFilterByPosition = (position) => {
    setFilterPosition(position);
    setFilterTeam(''); // Clear team filter when filtering by position
  };

  const handleClearFilters = () => {
    setFilterTeam('');
    setFilterPosition('');
  };

  if (status === 'loading') {
    return <div className="loading-message">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="error-message">Error loading players.</div>;
  }

  return (
    <div className="player-list-page">
      <h2 className="player-list-title">Player List</h2>
      <div className="sort-options">
        <label htmlFor="sort">Sort by: </label>
        <select id="sort" value={sortType} onChange={handleSortChange} className="sort-select">
          <option value="">Select</option>
          <option value="team">Team</option>
          <option value="position">Position</option>
          <option value="ranking">Ranking</option>
        </select>
        <button onClick={handleClearFilters} className="clear-filters-button">Clear Filters</button>
      </div>
      <ul className="player-list">
        {sortedPlayers.map((player) => (
          <li key={player.id} className="player-card">
            <Link to={`/players/${player.id}`} className="player-link">{player.name}</Link> - 
            <button onClick={() => handleFilterByTeam(player.team)} className="filter-button">{player.team}</button> - 
            <button onClick={() => handleFilterByPosition(player.position)} className="filter-button">{player.position}</button> - 
            <span className="player-ranking">Avg Rank: {player.average_rank && !isNaN(player.average_rank) ? Number(player.average_rank).toFixed(2) : 'N/A'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;
