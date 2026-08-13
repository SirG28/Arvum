import { describe, expect, it } from "vitest";
import { paymentRequestSchema } from "./payment.schema";

describe("paymentRequestSchema", () => {
  it("aceita cartão de crédito simulado", () => {
    expect(paymentRequestSchema.safeParse({ method: "CREDIT_CARD" }).success).toBe(true);
  });

  it("aceita pix simulado", () => {
    expect(paymentRequestSchema.safeParse({ method: "PIX" }).success).toBe(true);
  });

  it("rejeita forma de pagamento inválida", () => {
    expect(paymentRequestSchema.safeParse({ method: "BOLETO" }).success).toBe(false);
  });

  it("rejeita corpo vazio", () => {
    expect(paymentRequestSchema.safeParse({}).success).toBe(false);
  });
});
