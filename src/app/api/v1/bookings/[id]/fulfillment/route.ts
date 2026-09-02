import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { fulfillmentActionSchema } from "@/features/bookings/schemas/booking.schema";
import { advanceBookingFulfillment } from "@/features/bookings/services/booking.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Avança o aluguel para a próxima etapa de acompanhamento (Context.md §8.9: transporte, entrega,
// uso e devolução) — advanceBookingFulfillment decide, a partir do status atual e da modalidade
// logística, se o usuário logado é de fato o responsável pela próxima ação (nunca confiando em um
// papel enviado pelo cliente).
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = fulfillmentActionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await advanceBookingFulfillment(session.user.id, id, parsed.data.action);

  if (result === "NOT_FOUND") {
    return apiError("BOOKING_NOT_FOUND", "Aluguel não encontrado.", 404);
  }
  if (result === "FORBIDDEN") {
    return apiError("FORBIDDEN", "Você não pode executar esta ação neste aluguel.", 403);
  }
  if (result === "INVALID_TRANSITION") {
    return apiError(
      "BOOKING_INVALID_TRANSITION",
      "Esta ação não é mais válida para o estágio atual do aluguel.",
      409,
    );
  }

  return apiSuccess(result);
}
