"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useDeactivateAccount } from "../hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Alert } from "@/components/ui/Alert";

export function DeactivateAccountButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutation = useDeactivateAccount();

  async function handleConfirm() {
    setError(null);
    try {
      await mutation.mutateAsync();
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="error" title={error} />}
      <Button variant="danger" className="self-start" onClick={() => setConfirmOpen(true)}>
        Desativar minha conta
      </Button>
      <ConfirmationDialog
        open={confirmOpen}
        title="Desativar sua conta?"
        description="Você será desconectado e não vai mais conseguir entrar na Arvum. Seu histórico de reservas e avaliações é mantido, mas anúncios ou solicitações em andamento não serão gerenciados por você depois disso — resolva o que estiver pendente antes de continuar."
        confirmLabel="Sim, desativar conta"
        cancelLabel="Voltar"
        tone="danger"
        isLoading={mutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
