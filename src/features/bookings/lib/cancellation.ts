import type { BookingStatus } from "@prisma/client";

// Estados anteriores à confirmação de pagamento (Context.md §9.4: "antes da aprovação" e "depois
// da aprovação e antes do pagamento" → cancelamento sempre sem cobrança). Como o módulo de
// pagamento ainda não existe nesta fase, toda reserva alcançável hoje se enquadra nesse caso — a
// política de estorno após pagamento fica para quando o Payment existir. Sem dependências de
// servidor (Prisma client) para poder ser importado tanto pelo serviço quanto pela interface.
export const RENTER_CANCELLABLE_STATUSES = [
  "DRAFT",
  "AWAITING_APPROVAL",
  "APPROVED",
  "AWAITING_PAYMENT",
] as const satisfies readonly BookingStatus[];

export function isBookingCancellableByRenter(status: BookingStatus): boolean {
  return (RENTER_CANCELLABLE_STATUSES as readonly BookingStatus[]).includes(status);
}
