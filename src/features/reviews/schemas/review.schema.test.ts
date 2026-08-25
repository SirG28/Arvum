import { describe, expect, it } from "vitest";
import { reviewRequestSchema } from "./review.schema";

describe("reviewRequestSchema", () => {
  it("aceita apenas a nota geral", () => {
    expect(reviewRequestSchema.safeParse({ rating: 5 }).success).toBe(true);
  });

  it("aceita nota geral com aspectos e comentário", () => {
    const result = reviewRequestSchema.safeParse({
      rating: 4,
      machineConditionRating: 5,
      communicationRating: 3,
      punctualityRating: 4,
      logisticsRating: 4,
      comment: "Máquina em ótimo estado.",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita nota fora do intervalo de 1 a 5", () => {
    expect(reviewRequestSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewRequestSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it("rejeita nota não inteira", () => {
    expect(reviewRequestSchema.safeParse({ rating: 3.5 }).success).toBe(false);
  });

  it("rejeita corpo sem nota geral", () => {
    expect(reviewRequestSchema.safeParse({ comment: "Sem nota" }).success).toBe(false);
  });

  it("rejeita comentário acima de 1000 caracteres", () => {
    const result = reviewRequestSchema.safeParse({ rating: 5, comment: "a".repeat(1001) });
    expect(result.success).toBe(false);
  });
});
