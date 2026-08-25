"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_METHODS, type PaymentMethod } from "../schemas/payment.schema";
import { PAYMENT_METHOD_LABELS } from "../lib/payment-method-labels";
import { useConfirmPayment } from "../hooks/usePayments";
import { markBookingJustAdvanced } from "@/features/bookings/lib/timeline-highlight";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PaymentFormProps {
  bookingId: string;
  totalValueInCents: number;
  className?: string;
}

// Pagamento simulado (Context.md §8.13): nenhum campo de cartão é coletado — só a forma de
// pagamento, para deixar claro ao locatário que se trata de um ambiente de simulação, não de um
// checkout real.
export function PaymentForm({ bookingId, totalValueInCents, className }: PaymentFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [error, setError] = useState<string | null>(null);
  const mutation = useConfirmPayment(bookingId);

  async function handleConfirm() {
    setError(null);
    try {
      await mutation.mutateAsync({ method });
      markBookingJustAdvanced(bookingId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {error && <Alert tone="error" title={error} />}

      <Alert tone="info" title="Ambiente de simulação">
        Nenhum dado de cartão é solicitado ou armazenado. O pagamento é confirmado automaticamente
        para fins de demonstração.
      </Alert>

      <FormField label="Forma de pagamento" required>
        <Select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
          {PAYMENT_METHODS.map((value) => (
            <option key={value} value={value}>
              {PAYMENT_METHOD_LABELS[value]}
            </option>
          ))}
        </Select>
      </FormField>

      <Button className="w-full" isLoading={mutation.isPending} onClick={handleConfirm}>
        Confirmar pagamento de {formatBRL(totalValueInCents)}
      </Button>
    </div>
  );
}
