import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { bookingDecisionSchema } from "@/features/bookings/schemas/booking.schema";
import { decideBookingRequest } from "@/features/bookings/services/booking.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Só o proprietário da máquina decide (Context.md §8.8) — nunca o locatário, mesmo sendo dono da
// reserva, e nunca uma reserva de outro proprietário (checado em decideBookingRequest).
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bookingDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await decideBookingRequest(
    session.user.id,
    id,
    parsed.data.decision,
    parsed.data.reason,
  );

  if (result === "NOT_FOUND") {
    return apiError("BOOKING_NOT_FOUND", "Reserva não encontrada.", 404);
  }
  if (result === "NOT_PENDING") {
    return apiError(
      "BOOKING_NOT_PENDING",
      "Esta solicitação já foi decidida ou não está mais aguardando aprovação.",
      409,
    );
  }

  return apiSuccess({ status: result });
}
