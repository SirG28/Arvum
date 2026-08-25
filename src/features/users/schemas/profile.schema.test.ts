import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile.schema";

describe("profileSchema", () => {
  it("aceita só o nome, sem documento", () => {
    const result = profileSchema.safeParse({ name: "Maria Silva" });
    expect(result.success).toBe(true);
  });

  it("aceita CPF com pontuação, guardando só os dígitos", () => {
    const result = profileSchema.safeParse({
      name: "Maria Silva",
      documentType: "CPF",
      documentNumber: "123.456.789-01",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.documentNumber).toBe("12345678901");
  });

  it("rejeita CPF com quantidade errada de dígitos", () => {
    const result = profileSchema.safeParse({
      name: "Maria Silva",
      documentType: "CPF",
      documentNumber: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita número de documento sem escolher o tipo", () => {
    const result = profileSchema.safeParse({ name: "Maria Silva", documentNumber: "12345678901" });
    expect(result.success).toBe(false);
  });

  it("rejeita tipo de documento sem número", () => {
    const result = profileSchema.safeParse({ name: "Maria Silva", documentType: "CPF" });
    expect(result.success).toBe(false);
  });

  it("rejeita nome muito curto", () => {
    const result = profileSchema.safeParse({ name: "Jo" });
    expect(result.success).toBe(false);
  });

  it("rejeita URL de avatar inválida", () => {
    const result = profileSchema.safeParse({ name: "Maria Silva", avatarUrl: "não-é-url" });
    expect(result.success).toBe(false);
  });
});
