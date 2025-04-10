// src/utils/homeUtils.js
export const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };
  
export const getTopRankedPlayers = (rankings, players, userId = null) => {
  const filtered = userId
    ? rankings.filter(r => r.user_id === userId)
    : rankings;

  return [...filtered] // clone the array first to avoid mutation
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)
    .map(r => players.find(p => p.id === r.player_id));
};
  
  