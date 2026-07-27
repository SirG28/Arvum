import { describe, expect, it } from "vitest";
import { signupSchema } from "./signup.schema";

const validPayload = {
  name: "Maria Produtora",
  email: "maria@example.com",
  password: "Senha123",
  phone: "",
  acceptedTerms: "on",
};

describe("signupSchema", () => {
  it("aceita um cadastro válido", () => {
    const result = signupSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejeita senha sem letra maiúscula", () => {
    const result = signupSchema.safeParse({ ...validPayload, password: "senha123" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha sem número", () => {
    const result = signupSchema.safeParse({ ...validPayload, password: "SenhaForte" });
    expect(result.success).toBe(false);
  });

  it("rejeita quando os termos não foram aceitos", () => {
    const rest: Record<string, string> = { ...validPayload };
    delete rest.acceptedTerms;
    const result = signupSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejeita nome muito curto", () => {
    const result = signupSchema.safeParse({ ...validPayload, name: "Jo" });
    expect(result.success).toBe(false);
  });
});
