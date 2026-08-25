import { describe, expect, it } from "vitest";
import { changeEmailRequestSchema } from "./change-email.schema";

describe("changeEmailRequestSchema", () => {
  it("aceita e-mail válido e senha informada", () => {
    const result = changeEmailRequestSchema.safeParse({
      newEmail: "novo@exemplo.com",
      currentPassword: "Senha123",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = changeEmailRequestSchema.safeParse({
      newEmail: "não-é-email",
      currentPassword: "Senha123",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const result = changeEmailRequestSchema.safeParse({
      newEmail: "novo@exemplo.com",
      currentPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("normaliza o e-mail para minúsculas", () => {
    const result = changeEmailRequestSchema.safeParse({
      newEmail: "Novo@Exemplo.COM",
      currentPassword: "Senha123",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.newEmail).toBe("novo@exemplo.com");
  });
});
