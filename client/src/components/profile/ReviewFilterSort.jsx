// components/profile/ReviewFilterSort.jsx
import React from 'react';
import '../../style/ReviewFilterSort.css';


function ReviewFilterSort({
  teams,
  positions,
  sortType,
  filterTeam,
  handleFilterByTeam,
  handleFilterByPosition,
  handleSortChange,
  handleClearFilters
}) {
  return (
    <div className="filter-sort-container">
      <div className="position-filter-container">
        {positions.map((position) => (
          <button key={position} className="position-filter-circle" onClick={() => handleFilterByPosition(position)}>
            {position}
          </button>
        ))}
      </div>

      <div className="team-filter-container">
        <label htmlFor="team-filter" className="team-filter-label">Filter by Team:</label>
        <select id="team-filter" value={filterTeam} onChange={handleFilterByTeam} className="team-filter-dropdown">
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

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
    </div>
  );
}

export default ReviewFilterSort;
