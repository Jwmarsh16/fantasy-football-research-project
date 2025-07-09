// src/components/player/PlayerInfoCard.jsx
import React from 'react';
import '../../style/PlayerInfoCard.css';

// Map of NFL team names to their primary colors
const teamColors = {
  "Arizona Cardinals": "#97233F",
  "Atlanta Falcons": "#A71930",
  "Baltimore Ravens": "#241773",
  "Buffalo Bills": "#00338D",
  "Carolina Panthers": "#0085CA",
  "Chicago Bears": "#0B162A",
  "Cincinnati Bengals": "#FB4F14",
  "Cleveland Browns": "#311D00",
  "Dallas Cowboys": "#041E42",
  "Denver Broncos": "#002244",
  "Detroit Lions": "#0069B1",
  "Green Bay Packers": "#203731",
  "Houston Texans": "#03202F",
  "Indianapolis Colts": "#002C5F",
  "Jacksonville Jaguars": "#006778",
  "Kansas City Chiefs": "#E31837",
  "Las Vegas Raiders": "#000000",
  "Los Angeles Chargers": "#002A5E",
  "Los Angeles Rams": "#003594",
  "Miami Dolphins": "#008E97",
  "Minnesota Vikings": "#4F2683",
  "New England Patriots": "#002244",
  "New Orleans Saints": "#D3BC8D",
  "New York Giants": "#0B2265",
  "New York Jets": "#125740",
  "Philadelphia Eagles": "#004C54",
  "Pittsburgh Steelers": "#000000",
  "San Francisco 49ers": "#AA0000",
  "Seattle Seahawks": "#002244",
  "Tampa Bay Buccaneers": "#D50A0A",
  "Tennessee Titans": "#4B92DB",
  "Washington Commanders": "#773141"
};

const PlayerInfoCard = ({ player, getPlayerHeadshot, formatStatKey }) => {
  const {
    name,
    position,
    team,
    height,
    weight,
    birthdate,
    college,
    draft_info,
    status,
    stats = {},
    average_rank
  } = player;

  // Format birthdate to MM/DD/YYYY
  const formattedBirthdate = birthdate
    ? new Date(birthdate).toLocaleDateString('en-US')
    : null;

  const currentYear = new Date().getFullYear();

  // Determine summary category by position
  const pos = position.toUpperCase();
  let summaryKey = 'rushing';
  if (pos === 'QB') summaryKey = 'passing';
  else if (pos === 'WR' || pos === 'TE') summaryKey = 'receiving';

  const summaryStats = stats[summaryKey] || {};
  const summaryOrder = summaryKey === 'passing'
    ? ['yds', 'td', 'int', 'qbr']
    : ['yds', 'td', 'avg', 'lng'];

  const summaryEntries = summaryOrder
    .map(key => [key, summaryStats[key]])
    .filter(([_, value]) => value !== undefined);

  // Helper: check if a category has any non-zero stats
  const hasData = obj =>
    Object.entries(obj).some(
      ([k, v]) => k !== 'season' && k !== 'team' && typeof v === 'number' && v > 0
    );

  const categories = ['passing', 'rushing', 'receiving'];

  // Lookup team color or fallback to CSS variable
  const primaryColor = teamColors[team] || 'var(--color-primary)';

  return (
    <div className="player-info-card">
      {/* Header: avatar, metadata, and summary aligned horizontally */}
      <div className="info-header">
        <div className="avatar-section">
          <img
            src={getPlayerHeadshot(name)}
            onError={e => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150';
            }}
            alt={`${name} headshot`}
            className="player-avatar-img"
          />
          <h1 className="player-name">{name}</h1>
          <p className="player-position">{position} – {team}</p>
        </div>

        <div className="meta-section">
          {height && weight && (
            <p className="meta-item"><strong>HT/WT:</strong> {height} / {weight}</p>
          )}
          {formattedBirthdate && (
            <p className="meta-item"><strong>Birthdate:</strong> {formattedBirthdate}</p>
          )}
          {college && (
            <p className="meta-item"><strong>College:</strong> {college}</p>
          )}
          {draft_info && (
            <p className="meta-item"><strong>Draft:</strong> {draft_info}</p>
          )}
          {status && (
            <p className="meta-item"><strong>Status:</strong> {status}</p>
          )}
        </div>

        {summaryEntries.length > 0 && (
          <div
            className="summary-stats-card"
            style={{ '--summary-color': primaryColor }} // dynamic team color
          >
            <div className="summary-header">{currentYear} Regular Season Stats</div>
            <div className="summary-body">
              {summaryEntries.map(([key, value]) => (
                <div key={key} className="summary-item">
                  <div className="summary-value">{value}</div>
                  <div className="summary-label">{formatStatKey(key)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed stats tables */}
      {categories.map(cat => {
        const catStats = stats[cat] || {};
        if (!hasData(catStats)) return null;
        const entries = Object.entries(catStats);
        return (
          <div key={cat} className="player-stats">
            <h3 className="stats-title">{formatStatKey(cat)}</h3>
            <table className="stats-table">
              <thead>
                <tr>
                  {entries.map(([key]) => (
                    <th key={key}>{formatStatKey(key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {entries.map(([_, value], i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Average Rank */}
      <p className="average-rank">
        <strong>Average Rank:</strong>{' '}
        {average_rank !== null ? average_rank.toFixed(2) : 'N/A'}
      </p>
    </div>
  );
};

export default PlayerInfoCard;
