"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "../schemas/change-password.schema";
import { useChangePassword } from "../hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

export function ChangePasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(data: ChangePasswordInput) {
    setSubmitError(null);
    try {
      await mutation.mutateAsync(data);
      reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro inesperado.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {submitError && <Alert tone="error" title={submitError} />}

      <FormField label="Senha atual" required error={errors.currentPassword?.message}>
        <Input type="password" autoComplete="current-password" {...register("currentPassword")} />
      </FormField>
      <FormField label="Nova senha" required error={errors.newPassword?.message}>
        <Input type="password" autoComplete="new-password" {...register("newPassword")} />
      </FormField>
      <FormField label="Confirmar nova senha" required error={errors.confirmPassword?.message}>
        <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
      </FormField>

      <Button type="submit" isLoading={isSubmitting || mutation.isPending} className="self-start">
        Alterar senha
      </Button>
    </form>
  );
}
