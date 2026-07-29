import { describe, expect, it } from "vitest";
import { parseCatalogFilters } from "./catalog-filters.schema";

describe("parseCatalogFilters", () => {
  it("ignores absent fields", () => {
    const { filters, ignored } = parseCatalogFilters({});
    expect(filters).toEqual({});
    expect(ignored).toEqual([]);
  });

  it("parses text and price filters, converting reais to cents", () => {
    const { filters, ignored } = parseCatalogFilters({
      q: "trator",
      categoria: "tratores",
      marca: "John Deere",
      cultura: "soja",
      finalidade: "plantio",
      precoMin: "100",
      precoMax: "500.50",
    });

    expect(filters).toMatchObject({
      search: "trator",
      categorySlug: "tratores",
      brand: "John Deere",
      crop: "soja",
      purpose: "plantio",
      priceMinInCents: 10000,
      priceMaxInCents: 50050,
    });
    expect(ignored).toEqual([]);
  });

  it("coerces the operator checkbox from the raw form value", () => {
    expect(parseCatalogFilters({ operador: "on" }).filters.requiresOperator).toBe(true);
    expect(parseCatalogFilters({}).filters.requiresOperator).toBeUndefined();
  });

  it("ignores an inverted price range with a warning", () => {
    const { filters, ignored } = parseCatalogFilters({ precoMin: "500", precoMax: "100" });
    expect(filters.priceMinInCents).toBeUndefined();
    expect(filters.priceMaxInCents).toBeUndefined();
    expect(ignored).toEqual([{ field: "preco", message: expect.any(String) }]);
  });

  it("parses a valid period", () => {
    const { filters, ignored } = parseCatalogFilters({
      dataInicio: "2026-08-01",
      dataFim: "2026-08-10",
    });
    expect(filters.availableFrom).toEqual(new Date("2026-08-01"));
    expect(filters.availableTo).toEqual(new Date("2026-08-10"));
    expect(ignored).toEqual([]);
  });

  it("ignores a period with end date before or equal to start date", () => {
    const { filters, ignored } = parseCatalogFilters({
      dataInicio: "2026-08-10",
      dataFim: "2026-08-01",
    });
    expect(filters.availableFrom).toBeUndefined();
    expect(filters.availableTo).toBeUndefined();
    expect(ignored).toEqual([{ field: "periodo", message: expect.any(String) }]);
  });

  it("ignores a period with only one of the two dates", () => {
    const { filters, ignored } = parseCatalogFilters({ dataInicio: "2026-08-10" });
    expect(filters.availableFrom).toBeUndefined();
    expect(ignored).toEqual([{ field: "periodo", message: expect.any(String) }]);
  });
});
