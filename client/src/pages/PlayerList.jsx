import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../redux/slices/playerSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';
import { Link } from 'react-router-dom';
import '../style/PlayerListStyle.css';

// Function to get player headshot (local images)
const getPlayerHeadshot = (playerName) => {
  const formattedName = playerName.toLowerCase().replace(/ /g, "_");
  const imagePath = `/images/players/${formattedName}.png`;
  
  return imagePath; // Local image path
};

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
    const playersWithRankings = players.map((player) => {
      const playerRankings = rankings.filter((ranking) => ranking.player_id === player.id);
      const averageRank = playerRankings.length > 0
        ? playerRankings.reduce((sum, ranking) => sum + ranking.rank, 0) / playerRankings.length
        : null;
      return { ...player, average_rank: averageRank };
    });

    let filteredPlayers = [...playersWithRankings];
    if (filterTeam) {
      filteredPlayers = filteredPlayers.filter((player) => player.team === filterTeam);
    }
    if (filterPosition) {
      filteredPlayers = filteredPlayers.filter((player) => player.position === filterPosition);
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

  const handleFilterByTeam = (e) => {
    setFilterTeam(e.target.value);
    setFilterPosition('');
  };

  const handleFilterByPosition = (position) => {
    setFilterPosition(position);
    setFilterTeam('');
    setSortType('ranking');
  };

  const handleClearFilters = () => {
    setFilterTeam('');
    setFilterPosition('');
    setSortType('');
  };

  const teams = [...new Set(players.map((player) => player.team))];
  const positions = [...new Set(players.map((player) => player.position))];

  if (status === 'loading') {
    return <div className="loading-message">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="error-message">Error loading players.</div>;
  }

  return (
    <div className="player-list-page">
      <h2 className="player-list-title">Fantasy Football Player List</h2>

      {/* Position Circles for Filtering */}
      <div className="position-filter-container">
        {positions.map((position) => (
          <button
            key={position}
            className="position-filter-circle"
            onClick={() => handleFilterByPosition(position)}
          >
            {position}
          </button>
        ))}
      </div>

      {/* Team Dropdown for Filtering */}
      <div className="team-filter-container">
        <label htmlFor="team-filter" className="team-filter-label">Filter by Team:</label>
        <select
          id="team-filter"
          value={filterTeam}
          onChange={handleFilterByTeam}
          className="team-filter-dropdown"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
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

      {/* Player List */}
      <ul className="player-list">
        {sortedPlayers.map((player) => (
          <li key={player.id} className="player-card">
            <div className="player-card-content">
              {/* Player Avatar wrapped in a Link */}
              <div className="player-avatar">
                <Link to={`/players/${player.id}`}>
                  <img 
                    src={getPlayerHeadshot(player.name)}
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/150"; 
                    }} 
                    alt={`${player.name}'s Headshot`} 
                    className="player-avatar-img" 
                  />
                </Link>
              </div>
              {/* Updated Player Info */}
              <div className="player-info">
                <Link to={`/players/${player.id}`} className="player-link">
                  <h3 className="player-name">{player.name}</h3>
                </Link>
                <div className="player-meta">
                  <p><strong>Team:</strong> {player.team}</p>
                  <p><strong>Position:</strong> {player.position}</p>
                  <p>
                    <strong>Avg Rank:</strong> {player.average_rank && !isNaN(player.average_rank)
                      ? Number(player.average_rank).toFixed(2)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default PlayerList;
