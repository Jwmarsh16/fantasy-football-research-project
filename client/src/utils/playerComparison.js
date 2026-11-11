const receivingMetrics = [
  ['Receptions', 'receiving', 'rec'],
  ['Receiving yards', 'receiving', 'yds'],
  ['Receiving touchdowns', 'receiving', 'td'],
];

const metricsByPosition = {
  QB: [
    ['Passing yards', 'passing', 'yds'],
    ['Passing touchdowns', 'passing', 'td'],
    ['Interceptions', 'passing', 'int'],
    ['QBR', 'passing', 'qbr'],
    ['Rushing yards', 'rushing', 'yds'],
    ['Rushing touchdowns', 'rushing', 'td'],
  ],
  RB: [
    ['Rushing yards', 'rushing', 'yds'],
    ['Rushing touchdowns', 'rushing', 'td'],
    ['Yards per carry', 'rushing', 'avg'],
    ...receivingMetrics,
  ],
  WR: receivingMetrics,
  TE: receivingMetrics,
};

function getStat(player, category, key) {
  const value = player.stats?.[category]?.[key];
  return Number.isFinite(value) ? value : null;
}

export function getComparisonStats(firstPlayer, secondPlayer) {
  const position = firstPlayer.position;
  // Use stats supported by the sample data. K and DEF still show team and rankings.
  const metrics = Object.hasOwn(metricsByPosition, position) ? metricsByPosition[position] : [];

  return metrics.map(([label, category, key]) => ({
    label,
    firstValue: getStat(firstPlayer, category, key),
    secondValue: getStat(secondPlayer, category, key),
  })).filter(row => row.firstValue !== null || row.secondValue !== null);
}
