import { describe, expect, it } from "vitest";
import { calculateAverageRating } from "./rating";

describe("calculateAverageRating", () => {
  it("retorna null quando não há avaliações", () => {
    expect(calculateAverageRating([])).toBeNull();
  });

  it("retorna a própria nota quando há apenas uma avaliação", () => {
    expect(calculateAverageRating([4])).toBe(4);
  });

  it("calcula a média arredondada para uma casa decimal", () => {
    expect(calculateAverageRating([5, 4, 4])).toBe(4.3);
  });

  it("arredonda para cima quando o terceiro dígito é 5 ou mais", () => {
    expect(calculateAverageRating([5, 5, 4])).toBe(4.7);
  });
});
