// Destaque de parceiros Premium no catálogo (Context.md §8.21): reordena colocando os itens com
// hasPremium primeiro, sem descartar a ordenação já aplicada (distância/data) — Array.prototype.sort
// é estável em Node/V8, então isso só reordena o que empata em "hasPremium".
export function sortByPremiumFirst<T>(items: T[], hasPremium: (item: T) => boolean): T[] {
  return [...items].sort((a, b) => Number(hasPremium(b)) - Number(hasPremium(a)));
}
