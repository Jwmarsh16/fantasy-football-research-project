// src/components/profile/ReviewFilterSort.jsx
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
    <div className="review-filter-sort">
      <div className="review-filter-sort__positions">
        {positions.map((position) => (
          <button
            key={position}
            className="review-filter-sort__position-button"
            onClick={() => handleFilterByPosition(position)}
          >
            {position}
          </button>
        ))}
      </div>

      <div className="review-filter-sort__team">
        <label
          htmlFor="team-filter"
          className="review-filter-sort__team-label"
        >
          Filter by Team:
        </label>
        <select
          id="team-filter"
          value={filterTeam}
          onChange={handleFilterByTeam}
          className="review-filter-sort__team-dropdown"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <div className="review-filter-sort__sort">
        <label htmlFor="sort">Sort by:</label>
        <select
          id="sort"
          value={sortType}
          onChange={handleSortChange}
          className="review-filter-sort__sort-select"
        >
          <option value="">Select</option>
          <option value="team">Team</option>
          <option value="position">Position</option>
          <option value="ranking">Ranking</option>
        </select>
        <button
          onClick={handleClearFilters}
          className="review-filter-sort__clear-button"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default ReviewFilterSort;
