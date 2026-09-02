const STORAGE_KEY = "arvum:justAdvancedBookingId";

// A tela de detalhe do aluguel é renderizada no servidor (`getBookingForRenter`/
// `getBookingForOwner`) — cada ação (pagar, avançar etapa, cancelar, aprovar/recusar) chama
// `router.refresh()` depois de mutar, recarregando a página inteira. Sem um sinal explícito, não
// haveria como o `BookingStatusTimeline` distinguir "acabei de causar essa mudança de status" de
// "só abri este aluguel para consultar" — a diferença entre destacar a transição (MOTION.md,
// Etapa 5) e animar algo que não é novo para o usuário (decorativo, não funcional).
export function markBookingJustAdvanced(bookingId: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, bookingId);
  } catch {
    // sessionStorage indisponível (ex.: modo privado restritivo) — motion é só reforço visual,
    // sem impacto funcional na ação em si.
  }
}

// Consome (lê + limpa) a marca — só o carregamento de página imediatamente após a ação deve
// destacar a última entrada; uma visita seguinte ao mesmo aluguel não deve repetir a animação.
export function consumeBookingJustAdvanced(bookingId: string): boolean {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== bookingId) return false;
    sessionStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
