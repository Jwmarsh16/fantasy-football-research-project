// src/components/player/PlayerInfoCard.jsx
import React from 'react';
import '../../style/PlayerInfoCard.css';

const PlayerInfoCard = ({ player, getPlayerHeadshot, formatStatKey }) => {
  return (
    <div className="player-info-card">
      <div className="player-avatar">
        <img
          src={getPlayerHeadshot(player.name)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/150';
          }}
          alt={`${player.name}'s Headshot`}
          className="player-avatar-img"
        />
      </div>
      <h1 className="player-name">{player.name}</h1>
      <div className="player-details">
        <p><strong>Position:</strong> {player.position}</p>
        <p><strong>Team:</strong> {player.team}</p>
        <div className="player-stats">
          <h3 className="stats-title">Stats</h3>
          <table className="stats-table">
            <thead>
              <tr>
                {Object.keys(player.stats || {}).map((key) => (
                  <th key={key}>{formatStatKey(key)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(player.stats || {}).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Average Rank:</strong>{' '}
          {player.average_rank !== null ? player.average_rank.toFixed(2) : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default PlayerInfoCard;
