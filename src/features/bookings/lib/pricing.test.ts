import { describe, expect, it } from "vitest";
import { calculateRentalDays, calculateBookingTotals } from "./pricing";

describe("calculateRentalDays", () => {
  it("conta os dias corridos entre as duas datas", () => {
    const start = new Date("2026-08-01T00:00:00.000Z");
    const end = new Date("2026-08-04T00:00:00.000Z");
    expect(calculateRentalDays(start, end)).toBe(3);
  });

  it("nunca retorna menos de 1 dia", () => {
    const start = new Date("2026-08-01T00:00:00.000Z");
    const end = new Date("2026-08-01T12:00:00.000Z");
    expect(calculateRentalDays(start, end)).toBe(1);
  });
});

describe("calculateBookingTotals", () => {
  it("soma locação, logística, taxa e caução, subtraindo desconto", () => {
    const totals = calculateBookingTotals({
      rentalDays: 3,
      dailyPriceInCents: 10000,
      depositInCents: 5000,
      logisticsValueInCents: 2000,
      serviceFeeInCents: 1000,
      discountInCents: 500,
    });
    expect(totals).toEqual({
      rentalValueInCents: 30000,
      logisticsValueInCents: 2000,
      serviceFeeInCents: 1000,
      depositInCents: 5000,
      discountInCents: 500,
      totalValueInCents: 37500,
    });
  });

  it("trata caução ausente como zero", () => {
    const totals = calculateBookingTotals({
      rentalDays: 2,
      dailyPriceInCents: 15000,
      depositInCents: null,
    });
    expect(totals.depositInCents).toBe(0);
    expect(totals.totalValueInCents).toBe(30000);
  });
});
