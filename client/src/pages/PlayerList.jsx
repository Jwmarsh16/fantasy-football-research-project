import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../redux/slices/playerSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';

import PositionFilter from '../components/player/PositionFilter';
import TeamDropdown from '../components/player/TeamDropdown';
import SortControls from '../components/player/SortControls';
import PlayerCard from '../components/player/PlayerCard';

import '../style/PlayerListStyle.css';

const getPlayerHeadshot = (playerName) => {
  const formattedName = playerName.toLowerCase().replace(/ /g, "_");
  return `/images/players/${formattedName}.png`;
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
      const playerRankings = rankings.filter((r) => r.player_id === player.id);
      const averageRank = playerRankings.length
        ? playerRankings.reduce((sum, r) => sum + r.rank, 0) / playerRankings.length
        : null;
      return { ...player, average_rank: averageRank };
    });

    let filtered = [...playersWithRankings];
    if (filterTeam) filtered = filtered.filter(p => p.team === filterTeam);
    if (filterPosition) filtered = filtered.filter(p => p.position === filterPosition);

    let sorted = [...filtered];
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

  const handleSortChange = (e) => setSortType(e.target.value);
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

  const teams = [...new Set(players.map((p) => p.team))];
  const positions = [...new Set(players.map((p) => p.position))];

  if (status === 'loading') return <div className="loading-message">Loading...</div>;
  if (status === 'failed') return <div className="error-message">Error loading players.</div>;

  return (
    <div className="player-list-page">
      <h2 className="player-list-title">Fantasy Football Player List</h2>

      <PositionFilter positions={positions} onFilter={handleFilterByPosition} />
      <TeamDropdown teams={teams} selectedTeam={filterTeam} onChange={handleFilterByTeam} />
      <SortControls
        sortType={sortType}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
      />

      <ul className="player-list">
        {sortedPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            getPlayerHeadshot={getPlayerHeadshot}
          />
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;
