import type { BookingStatus } from "@prisma/client";

// Único estado em que o proprietário pode decidir uma solicitação (Context.md §8.8/§8.9) — usado
// tanto pelo serviço (rejeitar decisão fora de hora) quanto pela interface (esconder os botões de
// aprovar/recusar quando a reserva já foi decidida), mesmo padrão de isBookingCancellableByRenter.
export function isBookingPendingApproval(status: BookingStatus): boolean {
  return status === "AWAITING_APPROVAL";
}
