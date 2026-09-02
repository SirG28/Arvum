interface HeaderLike {
  get(name: string): string | null;
}

// Sem proxy reverso configurado neste projeto — em produção atrás de um (Vercel, nginx etc.), o
// cabeçalho x-forwarded-for carrega o IP real do cliente (o primeiro da lista, os demais são proxies
// intermediários); localmente cai para um valor fixo, já que a conexão TCP não é exposta nem a
// Server Actions nem a route handlers. Aceita tanto o Request do authorize quanto o headers() de
// next/headers — os dois implementam a mesma interface de leitura.
export function getClientIp(requestHeaders: HeaderLike): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();

  const realIp = requestHeaders.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
