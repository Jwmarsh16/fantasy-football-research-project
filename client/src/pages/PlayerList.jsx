// src/pages/PlayerList.jsx
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { fetchPlayers } from '../redux/slices/playerSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';
import { fetchRoster, addToRoster } from '../redux/slices/teamSlice';
import TeamDropdown from '../components/player/TeamDropdown';
import SortControls from '../components/player/SortControls';
import { compareCommunityRank, summarizePlayerRankings } from '../utils/rankingUtils';
import '../style/PlayerListStyle.css';

const getPlayerHeadshot = (playerName) => {
  const formattedName = playerName.toLowerCase().replace(/ /g, "_");
  return `/images/players/${formattedName}.png`;
};

function withFilters(searchParams, changes) {
  const next = new URLSearchParams(searchParams);
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}

function PlayerList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);

  const players = useSelector((state) => state.player.players);
  const rankings = useSelector((state) => state.ranking.rankings);
  const { roster, status: rosterStatus } = useSelector((state) => state.team);
  const status = useSelector((state) => state.player.status);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [rosterError, setRosterError] = useState('');

  const teams = [...new Set(players.map(player => player.team))].sort();
  const positions = [...new Set(players.map(player => player.position))];
  const requestedSort = searchParams.get('sort');
  const requestedTeam = searchParams.get('team');
  const requestedPosition = searchParams.get('position');
  const sortType = ['team', 'position', 'ranking'].includes(requestedSort) ? requestedSort : '';
  const filterTeam = teams.includes(requestedTeam) ? requestedTeam : '';
  const filterPosition = positions.includes(requestedPosition) ? requestedPosition : '';
  const catalogParams = withFilters(searchParams, { q: searchQuery });
  const catalogSearch = catalogParams.size ? `?${catalogParams}` : '';

  useEffect(() => {
    // Keep typing immediate while the router replaces the catalog URL.
    if (navigationType !== 'REPLACE') setSearchQuery(queryFromUrl);
  }, [navigationType, queryFromUrl]);

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
      dispatch(fetchRoster(currentUser.id));
    }
  }, [currentUser, dispatch]);

  const sortedPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = summarizePlayerRankings(players, rankings).filter(player => (
      (!filterTeam || player.team === filterTeam)
      && (!filterPosition || player.position === filterPosition)
      && (!query || player.name.toLowerCase().includes(query))
    ));

    if (sortType === 'team') {
      return filtered.sort((a, b) => a.team.localeCompare(b.team));
    } else if (sortType === 'position') {
      return filtered.sort((a, b) => a.position.localeCompare(b.position));
    } else if (sortType === 'ranking') {
      return filtered.sort(compareCommunityRank);
    }

    return filtered;
  }, [players, rankings, sortType, filterTeam, filterPosition, searchQuery]);

  const updateFilters = (changes) => {
    // Keep one catalog history entry so Back from a player restores its filters.
    setSearchParams(withFilters(searchParams, { q: searchQuery, ...changes }), { replace: true });
  };

  const handleFilterPosition = (position) => updateFilters({
    position: filterPosition === position ? '' : position,
    sort: sortType || 'ranking',
  });

  const handleAddToTeam = async (playerId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (rosterStatus === 'loading' || roster.some(entry => entry.player.id === playerId)) return;

    setRosterError('');
    try {
      await dispatch(addToRoster({
        userId: currentUser.id,
        playerId,
        slot: roster.length + 1,
        isStarter: false,
      })).unwrap();
    } catch {
      setRosterError('Could not add the player to your team. Please try again.');
    }
  };

  if (status === 'idle' || status === 'loading') return <div className="loading-message">Loading...</div>;
  if (status === 'failed') return <div className="error-message">Error loading players.</div>;

  return (
    <main className="player-list-page container">
      <div className="player-list-header">
        <div>
          <h1 className="player-list-title">Fantasy Football Player List</h1>
          <p className="player-list-data-note">
            <strong>Portfolio demo.</strong> Player profiles and stats use sample data.
          </p>
        </div>
        <Link className="ffrh-button" to="/players/compare" state={{ catalogSearch }}>Compare Players</Link>
      </div>

      <div className="player-list-controls">
        <label className="player-list-field player-list-search">
          Search by player name
          <input
            className="ffrh-field"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              const value = event.target.value;
              setSearchQuery(value);
              updateFilters({ q: value });
            }}
          />
        </label>
        <TeamDropdown
          teams={teams}
          selectedTeam={filterTeam}
          onChange={(event) => updateFilters({ team: event.target.value })}
        />
        <SortControls
          sortType={sortType}
          onSortChange={(event) => updateFilters({ sort: event.target.value })}
        />
        <div className="position-filter-container" role="group" aria-label="Filter by position">
          {positions.map(position => (
            <button
              type="button"
              key={position}
              className="ffrh-button ffrh-button--secondary position-filter-button"
              aria-pressed={position === filterPosition}
              onClick={() => handleFilterPosition(position)}
            >
              {position}
            </button>
          ))}
        </div>
      </div>

      <div className="player-list-results">
        <p role="status">{sortedPlayers.length} of {players.length} players</p>
        <button
          type="button"
          className="ffrh-button ffrh-button--secondary"
          disabled={!['q', 'team', 'position', 'sort'].some(key => searchParams.has(key))}
          onClick={() => {
            setSearchQuery('');
            updateFilters({ q: '', team: '', position: '', sort: '' });
          }}
        >
          Clear Filters
        </button>
      </div>
      {rosterError && <p className="player-list-roster-error" role="alert">{rosterError}</p>}

      {sortedPlayers.length === 0 ? (
        <p className="player-list-empty">
          {players.length ? 'No players match your filters.' : 'No players available.'}
        </p>
      ) : (
        <div className="player-table-container">
          <table className="player-table" role="table" aria-label="Players">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">Player</th>
                <th scope="col" role="columnheader">Position and team</th>
                <th scope="col" role="columnheader">Avg rank</th>
                <th scope="col" role="columnheader">Roster</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {sortedPlayers.map(player => {
                const added = Boolean(currentUser && roster.some(entry => entry.player.id === player.id));
                return (
                  <tr key={player.id} role="row">
                    <th scope="row" role="rowheader" className="player-table-identity">
                      <div className="player-table-player">
                        <img src={getPlayerHeadshot(player.name)} alt="" className="player-table-avatar" />
                        <Link to={`/players/${player.id}`} state={{ catalogSearch }} className="player-link">
                          {player.name}
                        </Link>
                      </div>
                    </th>
                    <td role="cell" className="player-table-team">
                      <span className="player-table-position">{player.position}</span>
                      {' · '}{player.team}
                    </td>
                    <td role="cell" className="player-table-rank">
                      <span className="player-table-rank-label" aria-hidden="true">Avg rank</span>
                      {player.average_rank === null ? 'N/A' : Number(player.average_rank).toFixed(2)}
                    </td>
                    <td role="cell" className="player-table-action">
                      <button
                        type="button"
                        className="ffrh-button ffrh-button--secondary"
                        onClick={() => handleAddToTeam(player.id)}
                        disabled={added || Boolean(currentUser && rosterStatus === 'loading')}
                      >
                        {added ? 'Added' : 'Add to Team'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default PlayerList;
