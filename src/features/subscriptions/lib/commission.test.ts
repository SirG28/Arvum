import { describe, expect, it } from "vitest";
import { getEffectiveCommissionRate, calculateCommissionInCents } from "./commission";
import { BASE_COMMISSION_RATE, PREMIUM_COMMISSION_RATE } from "../config";

describe("getEffectiveCommissionRate", () => {
  it("retorna a taxa reduzida para parceiros Premium", () => {
    expect(getEffectiveCommissionRate(true)).toBe(PREMIUM_COMMISSION_RATE);
  });

  it("retorna a taxa base para parceiros sem Premium", () => {
    expect(getEffectiveCommissionRate(false)).toBe(BASE_COMMISSION_RATE);
  });
});

describe("calculateCommissionInCents", () => {
  it("aplica a taxa base sobre o valor informado", () => {
    expect(calculateCommissionInCents(100000, false)).toBe(12000);
  });

  it("aplica a taxa reduzida para proprietário Premium", () => {
    expect(calculateCommissionInCents(100000, true)).toBe(8000);
  });

  it("arredonda o resultado para o centavo mais próximo", () => {
    expect(calculateCommissionInCents(999, false)).toBe(120);
  });
});
