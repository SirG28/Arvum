"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Alert } from "@/components/ui/Alert";
import { useCancelBooking } from "../hooks/useBookings";
import type { CancellationRefundOutcome } from "../lib/cancellation";
import { markBookingJustAdvanced } from "../lib/timeline-highlight";

interface CancelBookingButtonProps {
  bookingId: string;
  role: "RENTER" | "OWNER";
  refundOutcome: CancellationRefundOutcome;
}

// Mesma ação de cancelamento serve locatário e proprietário (Context.md §9.4) — o texto muda
// conforme quem cancela e o resultado do estorno (isBookingCancellableBy*/resolveCancellationRefund
// em lib/cancellation.ts), para nunca esconder do usuário o que vai acontecer com o pagamento antes
// de confirmar.
function describeOutcome(role: "RENTER" | "OWNER", refundOutcome: CancellationRefundOutcome): string {
  if (refundOutcome === "NOT_APPLICABLE") {
    return role === "RENTER"
      ? "Esta reserva ainda não foi paga, então o cancelamento não gera cobrança. A máquina volta a ficar disponível no período selecionado."
      : "Esta reserva ainda não foi paga. O locatário será avisado do cancelamento e a máquina volta a ficar disponível no período selecionado.";
  }
  if (refundOutcome === "FULL") {
    return role === "RENTER"
      ? "O pagamento já confirmado será estornado integralmente (simulado), pois faltam dias suficientes até o início do período."
      : "O pagamento já confirmado será estornado integralmente ao locatário (simulado).";
  }
  return "O pagamento já confirmado não será estornado, pois faltam menos de 3 dias para o início do período — essa é a política de cancelamento após o pagamento.";
}

export function CancelBookingButton({ bookingId, role, refundOutcome }: CancelBookingButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutation = useCancelBooking(bookingId);

  async function handleConfirm() {
    setError(null);
    try {
      await mutation.mutateAsync();
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
      <Button variant="danger" className="self-start" onClick={() => setConfirmOpen(true)}>
        Cancelar reserva
      </Button>
      <ConfirmationDialog
        open={confirmOpen}
        title="Cancelar esta reserva?"
        description={`${describeOutcome(role, refundOutcome)} Essa ação não pode ser desfeita.`}
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
