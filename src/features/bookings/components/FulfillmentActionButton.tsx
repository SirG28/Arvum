"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Alert } from "@/components/ui/Alert";
import { useAdvanceFulfillment } from "../hooks/useBookings";
import type { FulfillmentActionInfo } from "../lib/fulfillment";
import { markBookingJustAdvanced } from "../lib/timeline-highlight";

// Um único botão cobre as 6 ações de acompanhamento pós-pagamento (Context.md §8.9) — qual delas
// mostrar e para quem já vem decidido por getNextFulfillmentAction (lib/fulfillment.ts), a mesma
// fonte de verdade usada pela validação no servidor.
export function FulfillmentActionButton({
  bookingId,
  action,
}: {
  bookingId: string;
  action: FulfillmentActionInfo;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutation = useAdvanceFulfillment(bookingId);

  async function handleConfirm() {
    setError(null);
    try {
      await mutation.mutateAsync(action.action);
      setConfirmOpen(false);
      markBookingJustAdvanced(bookingId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="error" title={error} />}
      <Button className="self-start" onClick={() => setConfirmOpen(true)}>
        {action.label}
      </Button>
      <ConfirmationDialog
        open={confirmOpen}
        title={action.label}
        description={action.description}
        confirmLabel="Confirmar"
        cancelLabel="Voltar"
        tone="primary"
        isLoading={mutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
