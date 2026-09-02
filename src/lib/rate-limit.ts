interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface WindowState {
  count: number;
  resetAt: number;
}

// Sem Redis/serviço externo configurado neste projeto (mesmo padrão de adaptador simulado do
// resto do projeto — Context.md §27) — um Map em memória do próprio processo já resolve o caso de
// uso real aqui (um único servidor Node de longa duração, não funções serverless distribuídas).
// Troque por um rate limiter distribuído (ex.: Upstash) se a aplicação passar a rodar em múltiplas
// instâncias.
const store = new Map<string, WindowState>();

// Evita crescimento sem limite do Map ao longo da vida do processo — limpa entradas expiradas a
// cada N chamadas em vez de um setInterval (que manteria o processo "vivo" desnecessariamente e
// complicaria testes).
let callsSinceCleanup = 0;
const CLEANUP_INTERVAL = 200;

function cleanupExpired(now: number) {
  callsSinceCleanup += 1;
  if (callsSinceCleanup < CLEANUP_INTERVAL) return;
  callsSinceCleanup = 0;
  for (const [key, state] of store) {
    if (state.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

// Janela fixa por chave (ex.: IP, e-mail): as primeiras `max` chamadas dentro de `windowMs` são
// permitidas: passado isso, toda chamada é bloqueada até a janela expirar. Cada chamada já conta
// como uma tentativa (efeito colateral), não é só uma checagem — não precisa de uma função
// separada pra registrar o uso.
export function consumeRateLimit(key: string, { windowMs, max }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
