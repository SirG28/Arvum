import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "./change-password.schema";

describe("changePasswordSchema", () => {
  it("aceita senha nova forte e confirmada", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Antiga123",
      newPassword: "NovaSenha1",
      confirmPassword: "NovaSenha1",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita quando a confirmação não bate com a nova senha", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Antiga123",
      newPassword: "NovaSenha1",
      confirmPassword: "Diferente1",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quando a nova senha é igual à atual", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "MesmaSenha1",
      newPassword: "MesmaSenha1",
      confirmPassword: "MesmaSenha1",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nova senha fraca (sem número)", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Antiga123",
      newPassword: "SemNumero",
      confirmPassword: "SemNumero",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha atual vazia", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "NovaSenha1",
      confirmPassword: "NovaSenha1",
    });
    expect(result.success).toBe(false);
  });
});
