import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { bookingRequestSchema } from "@/features/bookings/schemas/booking.schema";
import { createBookingRequest } from "@/features/bookings/services/booking.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await createBookingRequest(session.user.id, id, parsed.data);

  if (result === "MACHINE_NOT_FOUND") {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  if (result === "CANNOT_BOOK_OWN_MACHINE") {
    return apiError(
      "CANNOT_BOOK_OWN_MACHINE",
      "Você não pode reservar uma máquina anunciada por você mesmo.",
      403,
    );
  }
  if (result === "PROPERTY_NOT_OWNED") {
    return apiError(
      "PROPERTY_NOT_OWNED",
      "Selecione uma propriedade cadastrada na sua conta como destino.",
      403,
    );
  }
  if (result === "RENTAL_PERIOD_TOO_SHORT") {
    return apiError(
      "RENTAL_PERIOD_TOO_SHORT",
      "O período informado é menor que a duração mínima de locação desta máquina.",
      422,
    );
  }
  if (result === "RENTAL_PERIOD_TOO_LONG") {
    return apiError(
      "RENTAL_PERIOD_TOO_LONG",
      "O período informado é maior que a duração máxima de locação desta máquina.",
      422,
    );
  }
  if (result === "MACHINE_UNAVAILABLE") {
    return apiError(
      "MACHINE_UNAVAILABLE",
      "A máquina não está disponível no período selecionado.",
      409,
    );
  }

  return apiSuccess(result, { status: 201 });
}
