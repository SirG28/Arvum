import { z } from "zod";

// Sem gateway real (Context.md §8.13/§27): nenhum campo de cartão é coletado, só a forma de
// pagamento escolhida — o "processamento" em si é simulado inteiramente no servidor.
export const PAYMENT_METHODS = ["CREDIT_CARD", "PIX"] as const;

export const paymentRequestSchema = z.object({
  method: z.enum(PAYMENT_METHODS, {
    required_error: "Selecione uma forma de pagamento.",
    invalid_type_error: "Selecione uma forma de pagamento.",
  }),
});

export type PaymentRequestInput = z.infer<typeof paymentRequestSchema>;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
