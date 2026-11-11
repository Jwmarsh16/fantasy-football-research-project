export function summarizePlayerRankings(players, rankings) {
  const totalsByPlayer = new Map();
  for (const { player_id, rank } of rankings) {
    const totals = totalsByPlayer.get(player_id) ?? { sum: 0, count: 0 };
    totals.sum += rank;
    totals.count += 1;
    totalsByPlayer.set(player_id, totals);
  }

  return players.map(player => {
    const totals = totalsByPlayer.get(player.id);
    return {
      ...player,
      average_rank: totals ? totals.sum / totals.count : null,
      vote_count: totals?.count ?? 0,
    };
  });
}

export function compareCommunityRank(a, b) {
  if (a.average_rank === b.average_rank) return a.id - b.id;
  return (a.average_rank ?? Infinity) - (b.average_rank ?? Infinity);
}

export function getCommunityTopRankedPlayers(players, rankings) {
  return summarizePlayerRankings(players, rankings)
    .filter(player => player.vote_count > 0)
    .sort(compareCommunityRank)
    .slice(0, 5);
}

export function getPersonalRankedPlayers(players, rankings, userId) {
  const playersById = new Map(players.map(player => [player.id, player]));
  return rankings
    .filter(vote => vote.user_id === userId && playersById.has(vote.player_id))
    .sort((a, b) => a.rank - b.rank || a.player_id - b.player_id)
    .map(vote => ({ ...playersById.get(vote.player_id), personal_rank: vote.rank }));
}

export function getPersonalTopRankedPlayers(players, rankings, userId) {
  return getPersonalRankedPlayers(players, rankings, userId).slice(0, 5);
}
