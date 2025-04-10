// src/components/home/RankingSidebar.jsx
import React from 'react';
import '../../style/RankingSidebar.css';

const RankingSidebar = ({ players, showOverall, toggleList }) => {
  return (
    <div className="sidebar">
      <h3 className="sidebar-title">
        {showOverall ? 'Top 5 Overall Ranked Players' : 'Your Top 5 Ranked Players'}
      </h3>
      <button className="toggle-button" onClick={toggleList}>
        {showOverall ? 'Switch to Your Top 5' : 'Switch to Overall Top 5'}
      </button>
      <ul className="ranking-list">
        {players?.map((player, index) => (
          <li key={player?.id || index} className="ranking-item">
            <span className="player-name">{player?.name || 'Unknown Player'}</span>{' '}
            <span className="player-team">{player?.team || 'Unknown Team'}</span>{' '}
            <span className="player-position">{player?.position || 'Unknown Position'}</span>{' '}
            <span className="player-rank">Rank: {index + 1}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RankingSidebar;
