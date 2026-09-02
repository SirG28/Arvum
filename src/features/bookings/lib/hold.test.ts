import { describe, expect, it } from "vitest";
import { BOOKING_HOLD_TTL_MINUTES, isPaymentHoldExpired } from "./hold";

describe("isPaymentHoldExpired", () => {
  const createdAt = new Date("2026-09-02T10:00:00Z");

  it("não expira dentro do prazo", () => {
    const now = new Date(createdAt.getTime() + (BOOKING_HOLD_TTL_MINUTES - 1) * 60_000);
    expect(isPaymentHoldExpired("AWAITING_PAYMENT", createdAt, now)).toBe(false);
  });

  it("expira depois do prazo", () => {
    const now = new Date(createdAt.getTime() + (BOOKING_HOLD_TTL_MINUTES + 1) * 60_000);
    expect(isPaymentHoldExpired("AWAITING_PAYMENT", createdAt, now)).toBe(true);
  });

  it("nunca expira fora de AWAITING_PAYMENT", () => {
    const now = new Date(createdAt.getTime() + (BOOKING_HOLD_TTL_MINUTES + 1) * 60_000);
    expect(isPaymentHoldExpired("PAYMENT_CONFIRMED", createdAt, now)).toBe(false);
  });
});
