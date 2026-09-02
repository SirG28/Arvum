import type { BookingStatus } from "@prisma/client";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: "Rascunho",
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAYMENT_CONFIRMED: "Pagamento confirmado",
  TRANSPORT_SCHEDULED: "Transporte agendado",
  IN_TRANSIT: "Em transporte",
  DELIVERED: "Entregue",
  IN_USE: "Em uso",
  AWAITING_RETURN: "Aguardando devolução",
  RETURNED: "Devolvido",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  IN_DISPUTE: "Em disputa",
};

export const BOOKING_STATUS_BADGE_TONE: Record<
  BookingStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  DRAFT: "neutral",
  AWAITING_PAYMENT: "warning",
  PAYMENT_CONFIRMED: "success",
  TRANSPORT_SCHEDULED: "info",
  IN_TRANSIT: "info",
  DELIVERED: "info",
  IN_USE: "success",
  AWAITING_RETURN: "warning",
  RETURNED: "neutral",
  COMPLETED: "success",
  CANCELLED: "neutral",
  IN_DISPUTE: "danger",
};
