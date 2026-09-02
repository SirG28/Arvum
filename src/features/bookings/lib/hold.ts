import type { BookingStatus } from "@prisma/client";

// Um aluguel nasce em AWAITING_PAYMENT já bloqueando a agenda (evita dois locatários pagando pelo
// mesmo período) — esse prazo é o tempo que um pedido não pago continua segurando a data antes de
// deixar de contar como ativo. Sem job em background: a expiração é sempre calculada sob demanda a
// partir de `createdAt` (ver activeBookingStatusFilter em machine.service.ts e o gate de pagamento
// em payment.service.ts), nunca escrita proativamente por um processo separado.
export const BOOKING_HOLD_TTL_MINUTES = 30;

export function isPaymentHoldExpired(
  status: BookingStatus,
  createdAt: Date,
  now: Date = new Date(),
): boolean {
  if (status !== "AWAITING_PAYMENT") return false;
  return now.getTime() - createdAt.getTime() > BOOKING_HOLD_TTL_MINUTES * 60_000;
}
