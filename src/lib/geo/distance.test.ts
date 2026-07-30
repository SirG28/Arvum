import { describe, expect, it } from "vitest";
import { calculateDistanceKm } from "./distance";

describe("calculateDistanceKm", () => {
  it("returns 0 for the same point", () => {
    const point = { latitude: -23.5505, longitude: -46.6333 };
    expect(calculateDistanceKm(point, point)).toBe(0);
  });

  it("calculates the approximate distance between São Paulo and Rio de Janeiro", () => {
    const saoPaulo = { latitude: -23.5505, longitude: -46.6333 };
    const rioDeJaneiro = { latitude: -22.9068, longitude: -43.1729 };
    const distance = calculateDistanceKm(saoPaulo, rioDeJaneiro);
    expect(distance).toBeGreaterThan(340);
    expect(distance).toBeLessThan(370);
  });

  it("is symmetric", () => {
    const a = { latitude: -21.1775, longitude: -47.8103 };
    const b = { latitude: -25.4284, longitude: -49.2733 };
    expect(calculateDistanceKm(a, b)).toBe(calculateDistanceKm(b, a));
  });
});
