import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("gera um hash diferente do texto original", async () => {
    const hash = await hashPassword("Demo@123");
    expect(hash).not.toBe("Demo@123");
  });

  it("valida a senha correta contra o hash", async () => {
    const hash = await hashPassword("Demo@123");
    await expect(verifyPassword("Demo@123", hash)).resolves.toBe(true);
  });

  it("rejeita a senha incorreta", async () => {
    const hash = await hashPassword("Demo@123");
    await expect(verifyPassword("SenhaErrada@1", hash)).resolves.toBe(false);
  });
});
