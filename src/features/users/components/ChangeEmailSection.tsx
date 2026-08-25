"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { changeEmailRequestSchema, type ChangeEmailRequestInput } from "../schemas/change-email.schema";
import {
  useRequestEmailChange,
  useConfirmEmailChange,
  useCancelEmailChange,
} from "../hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";

interface ChangeEmailSectionProps {
  email: string;
  pendingEmail: string | null;
}

export function ChangeEmailSection({ email, pendingEmail: initialPendingEmail }: ChangeEmailSectionProps) {
  const router = useRouter();
  const { update } = useSession();
  const [editing, setEditing] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(initialPendingEmail);
  const [confirmToken, setConfirmToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestMutation = useRequestEmailChange();
  const confirmMutation = useConfirmEmailChange();
  const cancelMutation = useCancelEmailChange();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeEmailRequestInput>({
    resolver: zodResolver(changeEmailRequestSchema),
    defaultValues: { newEmail: "", currentPassword: "" },
  });

  async function onSubmit(data: ChangeEmailRequestInput) {
    setError(null);
    try {
      const result = await requestMutation.mutateAsync(data);
      setPendingEmail(result.pendingEmail);
      setConfirmToken(result.token);
      setEditing(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  async function handleConfirm() {
    if (!confirmToken) return;
    setError(null);
    try {
      const updated = await confirmMutation.mutateAsync(confirmToken);
      setPendingEmail(null);
      setConfirmToken(null);
      await update({ email: updated.email });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  async function handleCancel() {
    setError(null);
    try {
      await cancelMutation.mutateAsync();
      setPendingEmail(null);
      setConfirmToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <FormField label="E-mail atual">
        <Input value={email} disabled readOnly />
      </FormField>

      {error && <Alert tone="error" title={error} />}

      {pendingEmail ? (
        <Alert tone="warning" title={`Confirmação pendente para ${pendingEmail}`}>
          <p>
            Sem um serviço de e-mail configurado ainda, a confirmação abaixo simula o clique no
            link que seria enviado.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              isLoading={confirmMutation.isPending}
              onClick={handleConfirm}
            >
              Confirmar novo e-mail (simulado)
            </Button>
            <Button
              type="button"
              variant="secondary"
              isLoading={cancelMutation.isPending}
              onClick={handleCancel}
            >
              Cancelar troca
            </Button>
          </div>
        </Alert>
      ) : editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <FormField label="Novo e-mail" required error={errors.newEmail?.message}>
            <Input type="email" {...register("newEmail")} />
          </FormField>
          <FormField label="Senha atual" required error={errors.currentPassword?.message}>
            <Input type="password" {...register("currentPassword")} />
          </FormField>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" isLoading={isSubmitting || requestMutation.isPending}>
              Enviar confirmação
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditing(false);
                reset();
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="secondary" className="self-start" onClick={() => setEditing(true)}>
          Alterar e-mail
        </Button>
      )}
    </div>
  );
}
