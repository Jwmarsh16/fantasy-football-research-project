import '../../style/PlayerInfoCard.css';

const categories = ['passing', 'rushing', 'receiving'];
const summaryLabels = {
  yds: 'Yards',
  td: 'Touchdowns',
  int: 'Interceptions',
  qbr: 'QBR',
  avg: 'Average',
  lng: 'Longest',
};

function hasData(stats) {
  return Object.entries(stats).some(
    ([key, value]) => key !== 'season' && key !== 'team' && typeof value === 'number' && value > 0
  );
}

function PlayerInfoCard({ player, formatStatKey }) {
  const { position, height, weight, birthdate, college, draft_info, status, stats = {} } = player;
  const pos = position.toUpperCase();
  let summaryCategory = 'rushing';
  if (pos === 'QB') summaryCategory = 'passing';
  else if (pos === 'WR' || pos === 'TE') summaryCategory = 'receiving';

  const summaryStats = stats[summaryCategory] || {};
  const summaryOrder = summaryCategory === 'passing'
    ? ['yds', 'td', 'int', 'qbr']
    : ['yds', 'td', 'avg', 'lng'];
  const summaryKeys = summaryOrder.filter(key => Number.isFinite(summaryStats[key]));
  const bio = [
    ['Height / Weight', height && weight && `${height} / ${weight}`],
    ['Birthdate', birthdate && new Date(birthdate).toLocaleDateString('en-US')],
    ['College', college],
    ['Draft', draft_info],
    ['Status', status],
  ].filter(([, value]) => Boolean(value));

  return (
    <section className="player-info-card" aria-labelledby="player-info-title">
      <h2 id="player-info-title">Stats and bio</h2>
      <div className="player-info-overview">
        {summaryKeys.length > 0 && (
          <div>
            <h3>{summaryStats.season && `${summaryStats.season} `}Regular Season Stats</h3>
            <dl className="player-summary-stats">
              {summaryKeys.map(key => (
                <div key={key}>
                  <dt>{summaryLabels[key]}</dt>
                  <dd>{summaryStats[key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {bio.length > 0 && (
          <div>
            <h3>Player bio</h3>
            <dl className="player-bio">
              {bio.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
      {categories.map(category => {
        const categoryStats = stats[category] || {};
        if (!hasData(categoryStats)) return null;
        const entries = Object.entries(categoryStats);
        const title = formatStatKey(category);
        const titleId = `player-stat-${category}`;
        return (
          <div key={category} className="player-stats">
            <h3 id={titleId}>{title}</h3>
            <div className="player-stat-scroll" role="region" aria-labelledby={titleId} tabIndex={0}>
              <table className="stats-table" aria-labelledby={titleId}>
                <thead>
                  <tr>
                    {entries.map(([key]) => (
                      <th key={key} scope="col">{formatStatKey(key)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {entries.map(([key, value]) => (
                      <td key={key}>{value}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default PlayerInfoCard;
