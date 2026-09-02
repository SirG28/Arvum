"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Subscription } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useSubscribeToPremium, useCancelSubscription } from "../hooks/useSubscription";
import { isPremiumActive } from "../lib/subscription-status";
import { PREMIUM_BENEFITS, PREMIUM_PRICE_IN_CENTS } from "../config";

interface SubscriptionCardProps {
  subscription: Pick<Subscription, "status" | "currentPeriodEnd"> | null;
  // Maior diária já anunciada pelo proprietário — só passado quando ele ainda não é Premium
  // (page.tsx não busca isso de quem já assina). Vira a prova de ROI concreta abaixo, em vez de
  // só a lista genérica de benefícios (Arvum Playbook §04).
  highestDailyPriceInCents?: number | null;
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { dateStyle: "long" });
}

export function SubscriptionCard({ subscription, highestDailyPriceInCents }: SubscriptionCardProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscribeMutation = useSubscribeToPremium();
  const cancelMutation = useCancelSubscription();

  const active = isPremiumActive(subscription);
  const roiDays =
    !active && highestDailyPriceInCents
      ? Math.max(1, Math.ceil(PREMIUM_PRICE_IN_CENTS / highestDailyPriceInCents))
      : null;

  async function handleSubscribe() {
    setError(null);
    try {
      await subscribeMutation.mutateAsync();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  async function handleCancel() {
    setError(null);
    try {
      await cancelMutation.mutateAsync();
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="error" title={error} />}

      {active ? (
        <Alert
          tone={subscription?.status === "CANCELED" ? "warning" : "success"}
          title={
            subscription?.status === "CANCELED"
              ? `Benefícios até ${formatDate(subscription.currentPeriodEnd)} — sem renovação automática`
              : `Assinatura ativa — válida até ${formatDate(subscription!.currentPeriodEnd)}`
          }
        />
      ) : (
        <Alert tone="info" title="Você ainda não tem o Plano Premium" />
      )}

      {roiDays !== null && highestDailyPriceInCents && (
        <p className="text-sm text-neutral-600">
          {roiDays === 1 ? (
            <>
              Uma diária da sua máquina de maior valor ({formatBRL(highestDailyPriceInCents)}) já
              cobre o plano inteiro.
            </>
          ) : (
            <>
              {roiDays} diárias da sua máquina de maior valor ({formatBRL(highestDailyPriceInCents)}
              /dia) já cobrem o plano inteiro — uma locação a mais no mês costuma bastar.
            </>
          )}
        </p>
      )}

      <ul className="list-disc pl-6 text-sm text-neutral-600">
        {PREMIUM_BENEFITS.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>

      {active && subscription?.status === "ACTIVE" ? (
        <Button variant="danger" className="self-start" onClick={() => setConfirmOpen(true)}>
          Cancelar assinatura
        </Button>
      ) : (
        <Button
          className="self-start"
          isLoading={subscribeMutation.isPending}
          onClick={handleSubscribe}
        >
          Assinar Plano Premium — {formatBRL(PREMIUM_PRICE_IN_CENTS)}/mês
        </Button>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        title="Cancelar o Plano Premium?"
        description="Os benefícios continuam disponíveis até o fim do período já pago — sem estorno, e você pode assinar de novo quando quiser."
        confirmLabel="Sim, cancelar assinatura"
        cancelLabel="Voltar"
        tone="danger"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
