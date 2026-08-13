"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Alert } from "@/components/ui/Alert";
import { useCancelBooking } from "../hooks/useBookings";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutation = useCancelBooking(bookingId);

  async function handleConfirm() {
    setError(null);
    try {
      await mutation.mutateAsync();
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="error" title={error} />}
      <Button variant="danger" className="self-start" onClick={() => setConfirmOpen(true)}>
        Cancelar reserva
      </Button>
      <ConfirmationDialog
        open={confirmOpen}
        title="Cancelar esta reserva?"
        description="Esta reserva ainda não foi paga, então o cancelamento não gera cobrança. A máquina volta a ficar disponível no período selecionado. Essa ação não pode ser desfeita."
        confirmLabel="Sim, cancelar reserva"
        cancelLabel="Voltar"
        tone="danger"
        isLoading={mutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
