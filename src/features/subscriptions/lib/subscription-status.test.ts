import { describe, expect, it } from "vitest";
import { isPremiumActive } from "./subscription-status";

const now = new Date("2026-08-27T12:00:00.000Z");

describe("isPremiumActive", () => {
  it("retorna false quando não há assinatura", () => {
    expect(isPremiumActive(null, now)).toBe(false);
  });

  it("retorna true quando o período atual ainda não terminou", () => {
    const subscription = { currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z") };
    expect(isPremiumActive(subscription, now)).toBe(true);
  });

  it("retorna false quando o período já terminou, mesmo que status ainda esteja ACTIVE no banco", () => {
    const subscription = { currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z") };
    expect(isPremiumActive(subscription, now)).toBe(false);
  });
});
