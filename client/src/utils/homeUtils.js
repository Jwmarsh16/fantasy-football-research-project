// src/utils/homeUtils.js
export const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };
