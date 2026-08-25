"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "../schemas/login.schema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
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
        <PasswordInput autoComplete="current-password" {...register("password")} />
      </FormField>

      {/* "Lembrar de mim" não altera a duração da sessão (não há essa configuração hoje) e
          recuperação de senha ainda não existe no back-end (ver Context.md §8.1) — os dois só
          para não deixar a expectativa do usuário sem nenhuma pista visual. */}
      <div className="-mt-2 flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-neutral-700">
          <input type="checkbox" className="rounded-sm border-neutral-300 text-primary-500" />
          Lembrar de mim
        </label>
        <span className="cursor-pointer font-medium text-primary-500 hover:underline">
          Esqueci minha senha
        </span>
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        Entrar
      </Button>
    </form>
  );
}
