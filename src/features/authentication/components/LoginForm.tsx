"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "../schemas/login.schema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/propriedades";
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setFormError("E-mail ou senha incorretos. Verifique os dados e tente novamente.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {formError && <Alert tone="error" title={formError} />}

      <FormField label="E-mail" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </FormField>

      <FormField label="Senha" required error={errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...register("password")} />
      </FormField>

      <Button type="submit" isLoading={isSubmitting}>
        Entrar
      </Button>
    </form>
  );
}
