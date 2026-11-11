import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PlayerInfoCard from './PlayerInfoCard';

describe('PlayerInfoCard', () => {
  it('formats sample stats and shows shared season and team once', () => {
    render(<PlayerInfoCard player={{
      position: 'QB',
      stats: {
        passing: { season: 2025, team: 'Kansas City Chiefs', gp: 14, yds: 2163, cmp_pct: 62.3, int: 0 },
        rushing: { season: 2025, team: 'Kansas City Chiefs', gp: 15, yds: 1047 },
        receiving: {
          season: 2025, team: 'Kansas City Chiefs', gp: 12,
          rec: 0, tgts: 0, yds: 0, avg: 0, td: 0, lng: 0, fd: 0, fum: 0,
        },
      },
    }} />);

    expect(screen.getByText('2025 season · Kansas City Chiefs')).toBeInTheDocument();
    expect(screen.getAllByText(/Kansas City Chiefs/)).toHaveLength(1);
    const passing = within(screen.getByRole('region', { name: 'Passing' }));
    expect(passing.getByText('2,163')).toBeInTheDocument();
    expect(passing.getByText('62.3%')).toBeInTheDocument();
    expect(passing.getByText('Interceptions').nextElementSibling).toHaveTextContent('0');
    expect(passing.getByText('Sacks taken').nextElementSibling).toHaveTextContent('—');
    expect(passing.getByText('GP').nextElementSibling).toHaveTextContent('14');
    expect(screen.queryByRole('region', { name: 'Receiving' })).toBeNull();
  });

  it('keeps meaningful zeroes and nonstandard categories with their own context', () => {
    render(<PlayerInfoCard player={{
      position: 'WR',
      stats: {
        receiving: { season: 2025, team: 'Buffalo Bills', rec: 0, yds: 0 },
        passing: { season: 2024, team: 'Kansas City Chiefs', att: 1, yds: 8 },
        rushing: { yds: 0 },
      },
    }} />);

    const passing = within(screen.getByRole('region', { name: 'Passing' }));
    const receiving = within(screen.getByRole('region', { name: 'Receiving' }));
    const rushing = within(screen.getByRole('region', { name: 'Rushing' }));
    expect(passing.getByText('2024 season · Kansas City Chiefs')).toBeInTheDocument();
    expect(receiving.getByText('2025 season · Buffalo Bills')).toBeInTheDocument();
    expect(receiving.getByText('Receptions').nextElementSibling).toHaveTextContent('0');
    expect(rushing.getByText('Yards').nextElementSibling).toHaveTextContent('0');
  });
});
