import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PlayerInfoCard from './PlayerInfoCard';

function statCell(table, name) {
  const header = table.getByRole('columnheader', { name });
  return table.getAllByRole('row')[1].cells[header.cellIndex];
}

describe('PlayerInfoCard', () => {
  it('renders and formats a season row under the compact stat headings', () => {
    render(<PlayerInfoCard player={{
      position: 'QB',
      stats: {
        passing: { season: 2025, team: 'Kansas City Chiefs', gp: 14, yds: 2163, avg: 7, cmp_pct: 62.3, int: 0 },
        rushing: { season: 2025, team: 'Kansas City Chiefs', gp: 15, yds: 1047 },
        receiving: {
          season: 2025, team: 'Kansas City Chiefs', gp: 12,
          rec: 0, tgts: 0, yds: 0, avg: 0, td: 0, lng: 0, fd: 0, fum: 0,
        },
      },
    }} />);

    const passing = within(screen.getByRole('table', { name: 'Passing' }));
    expect(passing.getAllByRole('columnheader').map(header => header.textContent)).toEqual([
      'Season', 'Team', 'GP', 'CMP', 'ATT', 'CMP%', 'YDS', 'AVG', 'TD', 'INT', 'LNG', 'SACK', 'RTG', 'QBR',
    ]);
    expect(passing.getByRole('rowheader', { name: '2025' })).toBeInTheDocument();
    expect(passing.getByRole('cell', { name: 'Kansas City Chiefs' })).toHaveTextContent('KC');
    expect(statCell(passing, 'Passing yards')).toHaveTextContent('2,163');
    expect(statCell(passing, 'Completion rate')).toHaveTextContent('62.3%');
    expect(statCell(passing, 'Yards per attempt')).toHaveTextContent('7.0');
    expect(statCell(passing, 'Interceptions')).toHaveTextContent('0');
    expect(statCell(passing, 'Sacks taken')).toHaveTextContent('—');
    expect(statCell(passing, 'Games played')).toHaveTextContent('14');
    expect(screen.queryByRole('table', { name: 'Receiving' })).toBeNull();
  });

  it('keeps meaningful zeroes and nonstandard categories with their own context', () => {
    render(<PlayerInfoCard player={{
      position: 'WR',
      stats: {
        receiving: { season: 2025, team: 'Buffalo Bills', rec: 0, yds: 0 },
        passing: { season: 2024, team: 'Kansas City Chiefs', att: 1, yds: 8 },
        rushing: { team: 'Legacy Team', yds: 0 },
      },
    }} />);

    const passing = within(screen.getByRole('table', { name: 'Passing' }));
    const receiving = within(screen.getByRole('table', { name: 'Receiving' }));
    const rushing = within(screen.getByRole('table', { name: 'Rushing' }));
    expect(passing.getByRole('rowheader', { name: '2024' })).toBeInTheDocument();
    expect(passing.getByRole('cell', { name: 'Kansas City Chiefs' })).toHaveTextContent('KC');
    expect(receiving.getByRole('rowheader', { name: '2025' })).toBeInTheDocument();
    expect(receiving.getByRole('cell', { name: 'Buffalo Bills' })).toHaveTextContent('BUF');
    expect(rushing.getByRole('cell', { name: 'Legacy Team' })).toHaveTextContent('Legacy Team');
    expect(statCell(receiving, 'Receptions')).toHaveTextContent('0');
    expect(statCell(rushing, 'Rushing yards')).toHaveTextContent('0');
  });
});
