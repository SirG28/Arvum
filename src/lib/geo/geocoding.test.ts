import { describe, expect, it } from "vitest";
import { mockGeocodingProvider } from "./geocoding";

describe("mockGeocodingProvider", () => {
  it("resolves a known city with its own coordinates", () => {
    const point = mockGeocodingProvider.geocode({ city: "Ribeirão Preto", state: "SP" });
    expect(point).toEqual({ latitude: -21.1775, longitude: -47.8103 });
  });

  it("is case- and accent-insensitive", () => {
    const point = mockGeocodingProvider.geocode({ city: "ribeirao preto", state: "sp" });
    expect(point).toEqual({ latitude: -21.1775, longitude: -47.8103 });
  });

  it("falls back to the state capital when the city is unknown", () => {
    const point = mockGeocodingProvider.geocode({ city: "Cidade Inexistente", state: "SP" });
    expect(point).toEqual({ latitude: -23.5505, longitude: -46.6333 });
  });

  it("returns null for an unknown state", () => {
    expect(mockGeocodingProvider.geocode({ city: "Qualquer", state: "ZZ" })).toBeNull();
  });
});
