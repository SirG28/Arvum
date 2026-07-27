import { describe, expect, it } from "vitest";
import { propertySchema } from "./property.schema";

const validPayload = {
  name: "Fazenda Santa Rita",
  addressLine: "Estrada Rural, s/n",
  city: "Ribeirão Preto",
  state: "sp",
  postalCode: "14000-000",
};

describe("propertySchema", () => {
  it("aceita uma propriedade válida e normaliza a UF para maiúsculas", () => {
    const result = propertySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    expect(result.success && result.data.state).toBe("SP");
  });

  it("rejeita nome muito curto", () => {
    const result = propertySchema.safeParse({ ...validPayload, name: "Fa" });
    expect(result.success).toBe(false);
  });

  it("rejeita UF com mais de 2 caracteres", () => {
    const result = propertySchema.safeParse({ ...validPayload, state: "SPX" });
    expect(result.success).toBe(false);
  });

  it("rejeita CEP muito curto", () => {
    const result = propertySchema.safeParse({ ...validPayload, postalCode: "123" });
    expect(result.success).toBe(false);
  });
});
