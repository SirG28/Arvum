import { describe, expect, it } from "vitest";
import { getEffectiveCommissionRate } from "./commission";
import { BASE_COMMISSION_RATE, PREMIUM_COMMISSION_RATE } from "../config";

describe("getEffectiveCommissionRate", () => {
  it("retorna a taxa reduzida para parceiros Premium", () => {
    expect(getEffectiveCommissionRate(true)).toBe(PREMIUM_COMMISSION_RATE);
  });

  it("retorna a taxa base para parceiros sem Premium", () => {
    expect(getEffectiveCommissionRate(false)).toBe(BASE_COMMISSION_RATE);
  });
});
