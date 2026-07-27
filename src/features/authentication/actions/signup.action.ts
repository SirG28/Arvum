"use server";

import { signupSchema } from "../schemas/signup.schema";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "../lib/password";
import { signIn } from "@/auth";

export interface SignupActionState {
  success: boolean;
  errors?: Record<string, string[]>;
  // Campos não sensíveis reenviados para repopular o formulário após uma falha de validação
  // (o React reseta inputs não controlados por padrão ao final de uma Server Action).
  // Senha nunca é incluída aqui.
  values?: { name?: string; email?: string; phone?: string; acceptedTerms?: boolean };
  submittedAt?: number;
}

function valuesFromFormData(formData: FormData): SignupActionState["values"] {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
  };
  return {
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    acceptedTerms: get("acceptedTerms") === "on",
  };
}

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const values = valuesFromFormData(formData);
  const submittedAt = Date.now();

  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors, values, submittedAt };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return {
      success: false,
      errors: { email: ["Este e-mail já está cadastrado."] },
      values,
      submittedAt,
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      phone: parsed.data.phone,
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/propriedades",
  });

  return { success: true };
}
