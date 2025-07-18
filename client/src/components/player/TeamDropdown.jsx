// src/components/player/TeamDropdown.jsx
import React from 'react';
import '../../style/TeamDropdown.css';

const TeamDropdown = ({ teams, selectedTeam, onChange }) => {
  return (
    <div className="team-filter-container">
      <label htmlFor="team-filter" className="team-filter-label">Filter by Team:</label>
      <div className="select-wrapper">
        <select
          id="team-filter"
          value={selectedTeam}
          onChange={onChange}
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
    </div>
  );
};

export default TeamDropdown;
