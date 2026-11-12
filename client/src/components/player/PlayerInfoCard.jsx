import { teamAbbreviations, teamColors } from '../../constants/teamColors';
import '../../style/PlayerInfoCard.css';

const categories = [
  {
    key: 'passing',
    title: 'Passing',
    positions: ['QB'],
    metrics: [
      ['gp', 'GP', 'Games played'],
      ['cmp', 'CMP', 'Completions'],
      ['att', 'ATT', 'Attempts'],
      ['cmp_pct', 'CMP%', 'Completion rate'],
      ['yds', 'YDS', 'Passing yards'],
      ['avg', 'AVG', 'Yards per attempt'],
      ['td', 'TD', 'Touchdowns'],
      ['int', 'INT', 'Interceptions'],
      ['lng', 'LNG', 'Longest pass'],
      ['sack', 'SACK', 'Sacks taken'],
      ['rtg', 'RTG', 'Passer rating'],
      ['qbr', 'QBR', 'Total QBR'],
    ],
  },
  {
    key: 'rushing',
    title: 'Rushing',
    positions: ['QB', 'RB'],
    metrics: [
      ['gp', 'GP', 'Games played'],
      ['car', 'CAR', 'Carries'],
      ['yds', 'YDS', 'Rushing yards'],
      ['avg', 'AVG', 'Yards per carry'],
      ['td', 'TD', 'Touchdowns'],
      ['lng', 'LNG', 'Longest rush'],
      ['fd', 'FD', 'First downs'],
      ['fum', 'FUM', 'Fumbles'],
    ],
  },
  {
    key: 'receiving',
    title: 'Receiving',
    positions: ['RB', 'WR', 'TE'],
    metrics: [
      ['gp', 'GP', 'Games played'],
      ['rec', 'REC', 'Receptions'],
      ['tgts', 'TGTS', 'Targets'],
      ['yds', 'YDS', 'Receiving yards'],
      ['avg', 'AVG', 'Yards per catch'],
      ['td', 'TD', 'Touchdowns'],
      ['lng', 'LNG', 'Longest catch'],
      ['fd', 'FD', 'First downs'],
      ['fum', 'FUM', 'Fumbles'],
    ],
  },
];

const statFormatter = new Intl.NumberFormat('en-US');
const decimalFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const decimalMetrics = new Set(['avg', 'cmp_pct', 'rtg', 'qbr']);

function formatStat(key, value) {
  if (!Number.isFinite(value)) return '—';
  const formatter = decimalMetrics.has(key) ? decimalFormatter : statFormatter;
  const formatted = formatter.format(value);
  return key === 'cmp_pct' ? `${formatted}%` : formatted;
}

function hasCategoryData({ metrics, positions, values }, position) {
  const categoryMetrics = metrics.filter(([key]) => key !== 'gp');
  // The seed fills unused categories with zeroes and a sample games-played count.
  const isSeedPlaceholder = !positions.includes(position) && Number.isFinite(values.gp)
    && categoryMetrics.every(([key]) => values[key] === 0);
  return !isSeedPlaceholder && categoryMetrics.some(([key]) => Number.isFinite(values[key]));
}

function PlayerInfoCard({ player }) {
  const { position, height, weight, birthdate, college, draft_info, status, stats } = player;
  const pos = position.toUpperCase();
  const groups = categories.map(category => ({
    ...category,
    values: stats?.[category.key] ?? {},
  })).filter(group => hasCategoryData(group, pos));

  const bio = [
    ['Height / Weight', height && weight && `${height} / ${weight}`],
    ['Birthdate', birthdate && new Date(birthdate).toLocaleDateString('en-US')],
    ['College', college],
    ['Draft', draft_info],
    ['Status', status],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="player-info-card">
      <section aria-labelledby="player-info-title">
        <h2 id="player-info-title">Stats</h2>
        <div className="player-stat-groups">
          {groups.length === 0 && <p className="player-stats-empty">Sample stats are unavailable for this player.</p>}
          {groups.map(({ key, title, metrics, values }) => {
            const titleId = `player-stat-${key}`;
            const team = typeof values.team === 'string' ? values.team.trim() : '';
            const teamCode = teamAbbreviations.get(team) ?? team;

            return (
              <div key={key} className="player-stat-group">
                <h3 id={titleId}>{title}</h3>
                <table className="player-stat-table" role="table" aria-labelledby={titleId}>
                  <thead role="rowgroup">
                    <tr role="row">
                      <th className="player-stat-season" scope="col" role="columnheader">Season</th>
                      <th className="player-stat-team" scope="col" role="columnheader">Team</th>
                      {metrics.map(([metric, abbreviation, label]) => (
                        <th key={metric} scope="col" role="columnheader" aria-label={label} title={label}>
                          {abbreviation}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody role="rowgroup">
                    <tr role="row">
                      <th className="player-stat-season" scope="row" role="rowheader">
                        <span className="player-stat-mobile-label" aria-hidden="true">Season</span>
                        <span>{values.season || '—'}</span>
                      </th>
                      <td className="player-stat-team" role="cell" aria-label={team || undefined}>
                        <span className="player-stat-mobile-label" aria-hidden="true">Team</span>
                        <span className="player-stat-team-value" title={team || undefined}>
                          {teamAbbreviations.has(team) && (
                            <span className="player-stat-team-marker" aria-hidden="true" style={{ backgroundColor: teamColors[team] }} />
                          )}
                          {teamCode || '—'}
                        </span>
                      </td>
                      {metrics.map(([metric, , label]) => (
                        <td key={metric} role="cell">
                          <span className="player-stat-mobile-label" aria-hidden="true">{label}</span>
                          <span>{formatStat(metric, values[metric])}</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </section>
      {bio.length > 0 && (
        <section className="player-bio-section" aria-labelledby="player-bio-title">
          <h2 id="player-bio-title">Player bio</h2>
          <dl className="player-bio">
            {bio.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

export default PlayerInfoCard;
