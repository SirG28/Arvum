import { describe, expect, it } from "vitest";
import { loginSchema } from "./login.schema";

describe("loginSchema", () => {
  it("aceita e-mail e senha válidos", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "123456" });
    expect(result.success).toBe(true);
  });

  it("normaliza o e-mail para minúsculas", () => {
    const result = loginSchema.safeParse({ email: "USER@Example.com", password: "123456" });
    expect(result.success && result.data.email).toBe("user@example.com");
  });

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});
