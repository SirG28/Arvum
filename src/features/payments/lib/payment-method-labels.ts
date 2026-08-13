import type { PaymentMethod } from "../schemas/payment.schema";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Cartão de crédito (simulado)",
  PIX: "Pix (simulado)",
};
