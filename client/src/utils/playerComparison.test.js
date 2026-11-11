import { describe, expect, it } from 'vitest';
import { getComparisonStats } from './playerComparison';

describe('player comparison statistics', () => {
  it('preserves zero and marks an absent value when the other player has the statistic', () => {
    const first = { position: 'QB', stats: { passing: { yds: 0, td: null, int: 1 } } };
    const second = { position: 'QB', stats: { passing: { yds: 3650, td: 25 } } };

    expect(getComparisonStats(first, second)).toEqual([
      { label: 'Passing yards', firstValue: 0, secondValue: 3650 },
      { label: 'Passing touchdowns', firstValue: null, secondValue: 25 },
      { label: 'Interceptions', firstValue: 1, secondValue: null },
    ]);
  });

  it.each(['K', 'DEF'])('omits unsupported sample statistics for %s', position => {
    const first = { position, stats: { rushing: { yds: 0 } } };
    const second = { position, stats: null };

    expect(getComparisonStats(first, second)).toEqual([]);
  });
});
