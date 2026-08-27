import { describe, expect, it } from "vitest";
import { sortByPremiumFirst } from "./premium-boost";

describe("sortByPremiumFirst", () => {
  it("coloca os itens Premium antes dos demais", () => {
    const items = [
      { id: "a", premium: false },
      { id: "b", premium: true },
      { id: "c", premium: false },
    ];
    const sorted = sortByPremiumFirst(items, (item) => item.premium);
    expect(sorted.map((item) => item.id)).toEqual(["b", "a", "c"]);
  });

  it("preserva a ordem relativa dentro de cada grupo (sort estável)", () => {
    const items = [
      { id: "a", premium: true },
      { id: "b", premium: false },
      { id: "c", premium: true },
      { id: "d", premium: false },
    ];
    const sorted = sortByPremiumFirst(items, (item) => item.premium);
    expect(sorted.map((item) => item.id)).toEqual(["a", "c", "b", "d"]);
  });

  it("não muda a ordem quando nenhum item é Premium", () => {
    const items = [{ id: "a", premium: false }, { id: "b", premium: false }];
    const sorted = sortByPremiumFirst(items, (item) => item.premium);
    expect(sorted.map((item) => item.id)).toEqual(["a", "b"]);
  });
});
