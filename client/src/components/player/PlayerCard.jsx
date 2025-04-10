import React from 'react';
import { Link } from 'react-router-dom';
import '../../style/PlayerCard.css';

const PlayerCard = ({ player, getPlayerHeadshot }) => {
  return (
    <li className="player-card">
      <div className="player-card-content">
        <div className="player-avatar">
          <Link to={`/players/${player.id}`}>
            <img
              src={getPlayerHeadshot(player.name)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150";
              }}
              alt={`${player.name}'s Headshot`}
              className="player-avatar-img"
            />
          </Link>
        </div>
        <div className="player-info">
          <Link to={`/players/${player.id}`} className="player-link">
            <h3 className="player-name">{player.name}</h3>
          </Link>
          <div className="player-meta">
            <p><strong>Team:</strong> {player.team}</p>
            <p><strong>Position:</strong> {player.position}</p>
            <p>
              <strong>Avg Rank:</strong>{" "}
              {player.average_rank && !isNaN(player.average_rank)
                ? Number(player.average_rank).toFixed(2)
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default PlayerCard;
