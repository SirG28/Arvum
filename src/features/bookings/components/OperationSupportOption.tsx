import type { UseFormRegisterReturn } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { OPERATION_SUPPORT_INFO, OPERATION_SUPPORT_PRICE_IN_CENTS } from "@/features/support/config";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface OperationSupportOptionProps {
  registration: UseFormRegisterReturn;
}

// Add-on opcional por reserva (Context.md §8.21/§9.7) — nunca uma assinatura, e o texto nunca
// sugere cobertura financeira contra danos (ver OPERATION_SUPPORT_INFO.disclaimer).
export function OperationSupportOption({ registration }: OperationSupportOptionProps) {
  return (
    <Card className="flex flex-col gap-2">
      <Checkbox
        id="operationSupportIncluded"
        label={`Adicionar ${OPERATION_SUPPORT_INFO.label} — ${formatBRL(OPERATION_SUPPORT_PRICE_IN_CENTS)}`}
        {...registration}
      />
      <ul className="list-disc pl-6 text-sm text-neutral-500">
        {OPERATION_SUPPORT_INFO.benefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
      <p className="text-xs text-neutral-400">{OPERATION_SUPPORT_INFO.disclaimer}</p>
    </Card>
  );
}
