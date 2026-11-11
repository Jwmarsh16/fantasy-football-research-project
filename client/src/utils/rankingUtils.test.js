import { describe, expect, it } from 'vitest';
import {
  compareCommunityRank,
  getCommunityTopRankedPlayers,
  getPersonalTopRankedPlayers,
  summarizePlayerRankings,
} from './rankingUtils';

describe('player rankings', () => {
  it('gives a player with several votes one spot ordered by their average', () => {
    const players = [7, 4, 5, 3, 1, 6, 2].map(id => ({ id }));
    const rankings = [
      { player_id: 1, user_id: 1, rank: 1 },
      { player_id: 1, user_id: 2, rank: 7 },
      { player_id: 2, user_id: 1, rank: 3 },
      { player_id: 3, user_id: 1, rank: 4 },
      { player_id: 4, user_id: 1, rank: 5 },
      { player_id: 5, user_id: 1, rank: 6 },
      { player_id: 6, user_id: 1, rank: 7 },
      { player_id: 99, user_id: 1, rank: 1 },
    ];

    expect(getCommunityTopRankedPlayers(players, rankings)).toEqual([
      { id: 2, average_rank: 3, vote_count: 1 },
      { id: 1, average_rank: 4, vote_count: 2 },
      { id: 3, average_rank: 4, vote_count: 1 },
      { id: 4, average_rank: 5, vote_count: 1 },
      { id: 5, average_rank: 6, vote_count: 1 },
    ]);
  });

  it('keeps unranked players in the catalog after ranked players', () => {
    const players = [{ id: 1 }, { id: 2 }];
    const rankings = [{ player_id: 2, user_id: 1, rank: 1 }];

    expect(summarizePlayerRankings(players, rankings).sort(compareCommunityRank)).toEqual([
      { id: 2, average_rank: 1, vote_count: 1 },
      { id: 1, average_rank: null, vote_count: 0 },
    ]);
  });

  it('shows the signed-in user’s saved ranks in their personal list', () => {
    const players = [{ id: 1 }, { id: 2 }];
    const rankings = [
      { player_id: 1, user_id: 1, rank: 7 },
      { player_id: 1, user_id: 2, rank: 1 },
      { player_id: 2, user_id: 1, rank: 3 },
    ];

    expect(getPersonalTopRankedPlayers(players, rankings, 1)).toEqual([
      { id: 2, personal_rank: 3 },
      { id: 1, personal_rank: 7 },
    ]);
  });
});
