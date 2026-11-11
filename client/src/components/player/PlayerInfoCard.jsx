import '../../style/PlayerInfoCard.css';

// The first four metrics in each category also appear in the season highlights.
const categories = [
  {
    key: 'passing',
    title: 'Passing',
    positions: ['QB'],
    metrics: [
      ['yds', 'Yards'], ['td', 'Touchdowns'], ['int', 'Interceptions'], ['qbr', 'QBR'],
      ['cmp_pct', 'CMP%'], ['cmp', 'Completions'], ['att', 'Attempts'], ['avg', 'Yards / attempt'],
      ['lng', 'Longest pass'], ['sack', 'Sacks taken'], ['rtg', 'Passer rating'], ['gp', 'GP'],
    ],
  },
  {
    key: 'rushing',
    title: 'Rushing',
    positions: ['QB', 'RB'],
    metrics: [
      ['yds', 'Yards'], ['td', 'Touchdowns'], ['avg', 'Yards / carry'], ['lng', 'Longest rush'],
      ['car', 'Carries'], ['fd', 'First downs'], ['fum', 'Fumbles'], ['gp', 'GP'],
    ],
  },
  {
    key: 'receiving',
    title: 'Receiving',
    positions: ['RB', 'WR', 'TE'],
    metrics: [
      ['yds', 'Yards'], ['td', 'Touchdowns'], ['avg', 'Yards / catch'], ['lng', 'Longest catch'],
      ['rec', 'Receptions'], ['tgts', 'Targets'], ['fd', 'First downs'], ['fum', 'Fumbles'], ['gp', 'GP'],
    ],
  },
];

const statFormatter = new Intl.NumberFormat('en-US');

function formatStat(key, value) {
  if (!Number.isFinite(value)) return '—';
  const formatted = statFormatter.format(value);
  return key === 'cmp_pct' ? `${formatted}%` : formatted;
}

function hasCategoryData({ metrics, positions, values }, position) {
  const categoryMetrics = metrics.filter(([key]) => key !== 'gp');
  // The seed fills unused categories with zeroes and a sample games-played count.
  const isSeedPlaceholder = !positions.includes(position) && Number.isFinite(values.gp)
    && categoryMetrics.every(([key]) => values[key] === 0);
  return !isSeedPlaceholder && categoryMetrics.some(([key]) => Number.isFinite(values[key]));
}

function getSharedValue(groups, key) {
  const value = groups[0]?.values[key];
  return groups.every(({ values }) => values[key] === value) ? value : null;
}

function formatSeasonTeam(season, team) {
  return [season && `${season} season`, team].filter(Boolean).join(' · ');
}

function PlayerInfoCard({ player }) {
  const { position, height, weight, birthdate, college, draft_info, status, stats } = player;
  const pos = position.toUpperCase();
  const groups = categories.map(category => ({
    ...category,
    values: stats?.[category.key] ?? {},
  })).filter(group => hasCategoryData(group, pos));

  let primaryCategory = 'rushing';
  if (pos === 'QB') primaryCategory = 'passing';
  else if (pos === 'WR' || pos === 'TE') primaryCategory = 'receiving';

  const summaryGroup = groups.find(({ key }) => key === primaryCategory);
  const summaryMetrics = summaryGroup?.metrics.slice(0, 4)
    .filter(([key]) => Number.isFinite(summaryGroup.values[key])) ?? [];
  const sharedSeason = getSharedValue(groups, 'season');
  const sharedTeam = getSharedValue(groups, 'team');
  const sharedContext = formatSeasonTeam(sharedSeason, sharedTeam);

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
      {sharedContext && <p className="player-stats-context">{sharedContext}</p>}
      <div className="player-info-overview">
        {summaryMetrics.length > 0 && (
          <div>
            <h3>{summaryGroup.title} highlights</h3>
            <dl className="player-summary-stats">
              {summaryMetrics.map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{formatStat(key, summaryGroup.values[key])}</dd>
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
      <div className="player-stat-groups">
        {groups.length === 0 && <p className="player-stats-context">Sample stats are unavailable for this player.</p>}
        {groups.map(({ key, title, metrics, values }) => {
          const titleId = `player-stat-${key}`;
          const context = formatSeasonTeam(sharedSeason ? null : values.season, sharedTeam ? null : values.team);

          return (
            <section key={key} className="player-stat-group" aria-labelledby={titleId}>
              <h3 id={titleId}>{title}</h3>
              {context && <p className="player-stats-context">{context}</p>}
              <dl className="player-stat-grid">
                {metrics.map(([metric, label]) => (
                  <div key={metric}>
                    <dt>{label}</dt>
                    <dd>{formatStat(metric, values[metric])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default PlayerInfoCard;
