import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { subscribeToPremium, cancelPremiumSubscription } from "@/features/subscriptions/services/subscription.service";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const subscription = await subscribeToPremium(session.user.id);
  return apiSuccess(subscription, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const result = await cancelPremiumSubscription(session.user.id);

  if (result === "NOT_FOUND") {
    return apiError("SUBSCRIPTION_NOT_FOUND", "Você ainda não tem uma assinatura Premium.", 404);
  }
  if (result === "ALREADY_CANCELED") {
    return apiError("SUBSCRIPTION_ALREADY_CANCELED", "Sua assinatura já está cancelada.", 409);
  }

  return apiSuccess({ status: result });
}
