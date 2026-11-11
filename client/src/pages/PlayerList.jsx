// src/pages/PlayerList.jsx
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';              // added useNavigate
import { fetchPlayers } from '../redux/slices/playerSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';
import { fetchRoster, addToRoster } from '../redux/slices/teamSlice'; // imported fetchRoster & addToRoster
import PositionFilter from '../components/player/PositionFilter';
import TeamDropdown from '../components/player/TeamDropdown';
import SortControls from '../components/player/SortControls';
import { compareCommunityRank, summarizePlayerRankings } from '../utils/rankingUtils';
import '../style/PlayerListStyle.css';

const getPlayerHeadshot = (playerName) => {
  const formattedName = playerName.toLowerCase().replace(/ /g, "_");
  return `/images/players/${formattedName}.png`;
};

function PlayerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();                                 // hook for redirects

  const players = useSelector((state) => state.player.players);
  const rankings = useSelector((state) => state.ranking.rankings);
  const roster = useSelector((state) => state.team.roster);      // current roster entries
  const status = useSelector((state) => state.player.status);
  const currentUser = useSelector((state) => state.auth.currentUser); // logged-in user

  const [sortType, setSortType] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  // initial fetch of players and rankings
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPlayers());
      dispatch(fetchRankings());
    }
  }, [status, dispatch]);

  // fetch roster when user logs in
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchRoster(currentUser.id));                     // load user roster
    }
  }, [currentUser, dispatch]);

  const sortedPlayers = useMemo(() => {
    let filtered = summarizePlayerRankings(players, rankings);
    if (filterTeam) filtered = filtered.filter(p => p.team === filterTeam);
    if (filterPosition) filtered = filtered.filter(p => p.position === filterPosition);

    if (sortType === 'team') {
      return filtered.sort((a, b) => a.team.localeCompare(b.team));
    } else if (sortType === 'position') {
      return filtered.sort((a, b) => a.position.localeCompare(b.position));
    } else if (sortType === 'ranking') {
      return filtered.sort(compareCommunityRank);
    }

    return filtered;
  }, [players, rankings, sortType, filterTeam, filterPosition]);

  // handler to add player to roster
  const handleAddToTeam = async (playerId) => {
    console.log('Adding player to team:', { playerId, currentUser, roster });
    
    if (!currentUser) {
      navigate('/login');                                       // redirect if unauthenticated
      return;
    }
    const nextSlot = roster.length + 1;                         // calculate next slot
    try {
      const result = await dispatch(addToRoster({
        userId: currentUser.id,
        playerId,
        slot: nextSlot,
        isStarter: false                                       // default to bench
      })).unwrap();
      console.log('Successfully added player to roster:', result);
    } catch (err) {
      console.error('Failed to add to roster', err);
    }
  };

  const teams = [...new Set(players.map((p) => p.team))];
  const positions = [...new Set(players.map((p) => p.position))];

  if (status === 'loading') return <div className="loading-message">Loading...</div>;
  if (status === 'failed') return <div className="error-message">Error loading players.</div>;

  return (
    <div className="player-list-page container">
      <h2 className="player-list-title">Fantasy Football Player List</h2>
      <p className="player-list-data-note">
        <strong>Portfolio demo.</strong> Player profiles and stats use sample data.
      </p>

      <div className="player-list-controls">
        <PositionFilter
          positions={positions}
          onFilter={(pos) => { setFilterPosition(pos); setFilterTeam(''); setSortType('ranking'); }}
        />
        <TeamDropdown
          teams={teams}
          selectedTeam={filterTeam}
          onChange={(e) => { setFilterTeam(e.target.value); setFilterPosition(''); }}
        />
        <SortControls
          sortType={sortType}
          onSortChange={(e) => setSortType(e.target.value)}
          onClearFilters={() => { setFilterTeam(''); setFilterPosition(''); setSortType(''); }}
        />
      </div>

      <div className="player-table-container">
        <table className="player-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Team</th>
              <th>Position</th>
              <th>Avg Rank</th>
              <th>Action</th>                        {/* new column header */}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <tr key={player.id}>
                <td>
                  <img
                    src={getPlayerHeadshot(player.name)}
                    alt={`${player.name} headshot`}
                    className="player-table-avatar"
                  />
                </td>
                <td>
                  <Link to={`/players/${player.id}`} className="player-link">
                    {player.name}
                  </Link>
                </td>
                <td>{player.team}</td>
                <td>{player.position}</td>
                <td>{player.average_rank !== null ? Number(player.average_rank).toFixed(2) : 'N/A'}</td>
                <td>
                  <button
                    onClick={() => handleAddToTeam(player.id)}  /* bind add handler */
                    disabled={roster.some((r) => r.player.id === player.id)}  /* disable if in roster */
                  >
                    {roster.some((r) => r.player.id === player.id)
                      ? 'Added'
                      : 'Add to Team'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlayerList;
