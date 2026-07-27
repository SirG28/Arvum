import { describe, expect, it } from "vitest";
import { machineSchema, toMachinePersistedData } from "./machine.schema";

const validPayload = {
  propertyId: "property-1",
  categoryId: "category-1",
  title: "Trator 4x4 Massey Ferguson",
  description: "Trator em ótimo estado, revisado recentemente, ideal para preparo de solo.",
  condition: "GOOD",
  dailyPrice: 150,
};

describe("machineSchema", () => {
  it("aceita um anúncio válido com campos opcionais ausentes", () => {
    const result = machineSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejeita descrição muito curta", () => {
    const result = machineSchema.safeParse({ ...validPayload, description: "Trator bom." });
    expect(result.success).toBe(false);
  });

  it("rejeita condição inválida", () => {
    const result = machineSchema.safeParse({ ...validPayload, condition: "PERFEITO" });
    expect(result.success).toBe(false);
  });

  it("rejeita preço diário zero ou negativo", () => {
    const result = machineSchema.safeParse({ ...validPayload, dailyPrice: 0 });
    expect(result.success).toBe(false);
  });

  it("rejeita duração máxima menor que a mínima", () => {
    const result = machineSchema.safeParse({
      ...validPayload,
      minimumRentalDays: 5,
      maximumRentalDays: 2,
    });
    expect(result.success).toBe(false);
  });

  it("transforma culturas recomendadas separadas por vírgula em array", () => {
    const result = machineSchema.safeParse({
      ...validPayload,
      recommendedCrops: "soja, milho,  algodão ",
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data.recommendedCrops).toEqual(["soja", "milho", "algodão"]);
  });

  it("trata campos numéricos opcionais vazios como ausentes, não como zero", () => {
    const result = machineSchema.safeParse({ ...validPayload, weight: "", hourlyPrice: "" });
    expect(result.success).toBe(true);
    expect(result.success && result.data.weight).toBeUndefined();
    expect(result.success && result.data.hourlyPrice).toBeUndefined();
  });

  it("converte valores em reais para centavos inteiros ao persistir", () => {
    const parsed = machineSchema.parse({ ...validPayload, dailyPrice: 150.5, deposit: 300 });
    const persisted = toMachinePersistedData(parsed);
    expect(persisted.dailyPriceInCents).toBe(15050);
    expect(persisted.depositInCents).toBe(30000);
  });
});
