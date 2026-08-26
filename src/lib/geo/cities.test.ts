import { describe, expect, it } from "vitest";
import { findExactCityMatches, searchCities } from "./cities";

describe("findExactCityMatches", () => {
  it("resolves a unique city name to its single state", () => {
    expect(findExactCityMatches("Londrina")).toEqual([{ city: "Londrina", state: "PR" }]);
  });

  it("is accent- and case-insensitive", () => {
    expect(findExactCityMatches("ribeirao preto")).toEqual([
      { city: "Ribeirão Preto", state: "SP" },
    ]);
  });

  it("returns every state sharing a duplicated city name", () => {
    const matches = findExactCityMatches("Água Boa");
    expect(matches).toEqual(
      expect.arrayContaining([
        { city: "Água Boa", state: "MG" },
        { city: "Água Boa", state: "MT" },
      ]),
    );
    expect(matches).toHaveLength(2);
  });

  it("returns nothing for an unknown name", () => {
    expect(findExactCityMatches("Cidade Que Não Existe")).toEqual([]);
  });
});

describe("searchCities", () => {
  it("requires at least two characters", () => {
    expect(searchCities("r")).toEqual([]);
  });

  it("matches by prefix, case- and accent-insensitive", () => {
    const results = searchCities("londr");
    expect(results).toEqual(expect.arrayContaining([{ city: "Londrina", state: "PR" }]));
  });

  it("respects the limit", () => {
    expect(searchCities("santa", 3)).toHaveLength(3);
  });
});
