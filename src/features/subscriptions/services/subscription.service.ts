import { prisma } from "@/lib/prisma";
import { PREMIUM_PERIOD_DAYS, PREMIUM_PRICE_IN_CENTS } from "../config";

export function getSubscriptionByOwner(ownerId: string) {
  return prisma.subscription.findUnique({ where: { ownerId } });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Assinar sempre inicia um novo período de 30 dias a partir de agora, pelo preço atual — sem
// scheduler para simular renovação de verdade (Context.md §27), e sem carregar tempo restante de
// uma assinatura anterior. Cancelar não estorna nem encerra o período já pago (Context.md §9.7),
// então reassinar a qualquer momento (mesmo com uma assinatura CANCELED ainda dentro do período)
// sempre substitui pelo período novo — um único registro por proprietário, nunca um histórico.
export async function subscribeToPremium(ownerId: string) {
  const now = new Date();
  return prisma.subscription.upsert({
    where: { ownerId },
    create: {
      ownerId,
      status: "ACTIVE",
      priceInCents: PREMIUM_PRICE_IN_CENTS,
      startedAt: now,
      currentPeriodEnd: addDays(now, PREMIUM_PERIOD_DAYS),
    },
    update: {
      status: "ACTIVE",
      priceInCents: PREMIUM_PRICE_IN_CENTS,
      startedAt: now,
      currentPeriodEnd: addDays(now, PREMIUM_PERIOD_DAYS),
      canceledAt: null,
    },
  });
}

export type CancelSubscriptionResult = "CANCELED" | "NOT_FOUND" | "ALREADY_CANCELED";

// Cancelar só impede a renovação futura — os benefícios continuam até currentPeriodEnd
// (Context.md §9.7: "o cancelamento não reduz retroativamente benefícios já utilizados no período
// pago"), então currentPeriodEnd nunca é alterado aqui.
export async function cancelPremiumSubscription(ownerId: string): Promise<CancelSubscriptionResult> {
  const subscription = await prisma.subscription.findUnique({ where: { ownerId } });
  if (!subscription) return "NOT_FOUND";
  if (subscription.status === "CANCELED") return "ALREADY_CANCELED";

  await prisma.subscription.update({
    where: { ownerId },
    data: { status: "CANCELED", canceledAt: new Date() },
  });

  return "CANCELED";
}
