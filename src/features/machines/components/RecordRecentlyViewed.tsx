"use client";

import { useEffect } from "react";
import {
  RECENTLY_VIEWED_COOKIE_NAME,
  RECENTLY_VIEWED_MAX_ENTRIES,
  RECENTLY_VIEWED_MAX_AGE_SECONDS,
  parseRecentlyViewedIds,
} from "../lib/recently-viewed";

function readCookieIds(): string[] {
  const match = document.cookie.match(new RegExp(`(?:^|; )${RECENTLY_VIEWED_COOKIE_NAME}=([^;]*)`));
  return parseRecentlyViewedIds(match?.[1]);
}

// Grava o id da máquina vista num cookie (sem tabela nova no banco) — a home lê esse mesmo cookie
// no servidor (cookies() de next/headers, via getMachinesByIds em machine.service.ts) pra montar
// "Vistos recentemente". Sem round-trip: o cookie já está pronto no próximo SSR, seja voltando pra
// home ou abrindo outra aba.
export function RecordRecentlyViewed({ machineId }: { machineId: string }) {
  useEffect(() => {
    const current = readCookieIds().filter((id) => id !== machineId);
    const next = [machineId, ...current].slice(0, RECENTLY_VIEWED_MAX_ENTRIES);
    document.cookie = `${RECENTLY_VIEWED_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=${RECENTLY_VIEWED_MAX_AGE_SECONDS}; SameSite=Lax`;
  }, [machineId]);

  return null;
}
