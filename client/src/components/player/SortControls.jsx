// src/components/player/SortControls.jsx
import React from 'react';
import '../../style/SortControls.css';

const SortControls = ({ sortType, onSortChange, onClearFilters }) => {
  return (
    <div className="sort-controls-container">
      <label htmlFor="sort" className="sort-label">Sort by:</label>
      <div className="select-wrapper">
        <select
          id="sort"
          value={sortType}
          onChange={onSortChange}
          className="sort-select"
        >
          <option value="">Select</option>
          <option value="team">Team</option>
          <option value="position">Position</option>
          <option value="ranking">Ranking</option>
        </select>
      </div>
      <button onClick={onClearFilters} className="clear-filters-button">
        Clear Filters
      </button>
    </div>
  );
};

export default SortControls;
