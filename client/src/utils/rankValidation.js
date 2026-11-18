import * as Yup from 'yup';

export function createRankSchema(maxRank) {
  return Yup.object({
    rank: Yup.number()
      .integer('Enter a whole number')
      .min(1, 'Rank must be at least 1')
      .max(maxRank, `Rank must be at most ${maxRank}`)
      .required('Required'),
  });
}
