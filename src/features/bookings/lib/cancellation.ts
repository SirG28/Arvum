import type { BookingStatus } from "@prisma/client";

// Antes do pagamento confirmado, o único estado possível é AWAITING_PAYMENT (Context.md §9.4:
// cancelamento sempre sem cobrança nesta janela, já que nada foi de fato pago ainda).
const RENTER_FREE_CANCEL_STATUSES = [
  "AWAITING_PAYMENT",
] as const satisfies readonly BookingStatus[];

// Após o pagamento confirmado, o locatário ainda pode cancelar até o transporte ser organizado —
// a partir de TRANSPORT_SCHEDULED a máquina já está em movimento/uso, então cancelamento
// self-service para de fazer sentido (Context.md §9.4 trata isso como "situação excepcional" a
// encaminhar para disputa, fora do escopo do MVP).
const RENTER_POST_PAYMENT_CANCEL_STATUSES = [
  "PAYMENT_CONFIRMED",
] as const satisfies readonly BookingStatus[];

// Não existe mais uma etapa de aprovação separada do cancelamento (a condição do aluguel é o
// próprio anúncio da máquina) — o proprietário pode cancelar a qualquer momento antes do
// pagamento (ex.: máquina indisponível de fato), sem cobrança, e continua podendo cancelar depois
// do pagamento confirmado, até o transporte ser organizado (mesmo limite superior do locatário).
const OWNER_CANCEL_STATUSES = [
  "AWAITING_PAYMENT",
  "PAYMENT_CONFIRMED",
] as const satisfies readonly BookingStatus[];

// Antecedência mínima, em dias corridos até o início do período, para estorno integral após o
// pagamento confirmado (Context.md §9.4: "cobrança ou estorno conforme antecedência"). Centralizado
// aqui — nunca um percentual espalhado pelo serviço ou pela interface.
export const CANCELLATION_POLICY = {
  minDaysBeforeStartForFullRefund: 3,
} as const;

export function isBookingCancellableByRenter(status: BookingStatus): boolean {
  return (
    (RENTER_FREE_CANCEL_STATUSES as readonly BookingStatus[]).includes(status) ||
    (RENTER_POST_PAYMENT_CANCEL_STATUSES as readonly BookingStatus[]).includes(status)
  );
}

export function isBookingCancellableByOwner(status: BookingStatus): boolean {
  return (OWNER_CANCEL_STATUSES as readonly BookingStatus[]).includes(status);
}

export type CancellationRefundOutcome = "NOT_APPLICABLE" | "FULL" | "NONE";

function daysUntil(startDate: Date, now: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((startDate.getTime() - now.getTime()) / msPerDay);
}

// Regra central do estorno (Context.md §9.4):
// - antes do pagamento confirmado: nada foi cobrado, então "sem cobrança" não é um estorno de
//   fato — NOT_APPLICABLE (a interface trata isso como "cancelamento sem cobrança").
// - cancelamento pelo proprietário: estorno integral ao locatário, sempre que já havia pagamento.
// - cancelamento pelo locatário após o pagamento: integral com >= `minDaysBeforeStartForFullRefund`
//   dias de antecedência do início do período; sem estorno abaixo disso.
export function resolveCancellationRefund(
  status: BookingStatus,
  startDate: Date,
  cancelledBy: "RENTER" | "OWNER",
  now: Date = new Date(),
): CancellationRefundOutcome {
  const hasConfirmedPayment = status === "PAYMENT_CONFIRMED";
  if (!hasConfirmedPayment) return "NOT_APPLICABLE";
  if (cancelledBy === "OWNER") return "FULL";
  return daysUntil(startDate, now) >= CANCELLATION_POLICY.minDaysBeforeStartForFullRefund
    ? "FULL"
    : "NONE";
}
