// Constantes e parsing do cookie de "vistos recentemente", num módulo sem "use client" de
// propósito: RecordRecentlyViewed.tsx (client, grava o cookie) e app/page.tsx (Server Component,
// lê via cookies() de next/headers) precisam do mesmo nome/formato — um módulo "use client" só
// expõe referências de componente através da fronteira RSC, não dados simples como esta constante
// (mesmo motivo documentado em categoryGroups.ts e, historicamente, em navItems.tsx).
export const RECENTLY_VIEWED_COOKIE_NAME = "arvum_recent_machines";
export const RECENTLY_VIEWED_MAX_ENTRIES = 8;
export const RECENTLY_VIEWED_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

// Parsing tolerante: um cookie ausente, corrompido ou de formato antigo nunca deve quebrar a
// renderização da home — só faz a seção "Vistos recentemente" não aparecer (mesma regra de
// HighlightBand.tsx para dados ausentes).
export function parseRecentlyViewedIds(rawCookieValue: string | undefined): string[] {
  if (!rawCookieValue) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookieValue));
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}
