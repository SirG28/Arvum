// Nota média recalculada de forma consistente (Context.md §9.5) — sempre derivada do conjunto
// atual de avaliações publicadas, nunca um contador incremental guardado à parte.
export function calculateAverageRating(ratings: number[]): number | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
