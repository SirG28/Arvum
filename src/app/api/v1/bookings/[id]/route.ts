import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { cancelBookingByRenter } from "@/features/bookings/services/booking.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// "Cancelar" em vez de excluir de fato: o histórico da reserva (BookingStatusHistory) é sempre
// preservado (Context.md §8.4/§9.3) — o método HTTP DELETE reflete a intenção do usuário
// ("excluir a reserva"), mas o servidor faz uma transição de status, nunca uma remoção física.
export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const result = await cancelBookingByRenter(session.user.id, id);

  if (result === "NOT_FOUND") {
    return apiError("BOOKING_NOT_FOUND", "Reserva não encontrada.", 404);
  }
  if (result === "NOT_CANCELLABLE") {
    return apiError(
      "BOOKING_NOT_CANCELLABLE",
      "Esta reserva não pode mais ser cancelada pelo estágio atual.",
      409,
    );
  }

  return apiSuccess({ status: "CANCELLED" });
}
