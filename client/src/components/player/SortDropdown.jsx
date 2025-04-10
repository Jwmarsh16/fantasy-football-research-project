// src/components/player/SortDropdown.jsx
import React from 'react';
import '../../style/SortDropdown.css';

const SortDropdown = ({ sortOrder, setSortOrder }) => (
  <div className="sort-options">
    <label htmlFor="sortOrder">Sort by Ranking: </label>
    <select
      id="sortOrder"
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
    >
      <option value="asc">Best to Worst</option>
      <option value="desc">Worst to Best</option>
    </select>
  </div>
);

export default SortDropdown;
