import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { reviewRequestSchema } from "@/features/reviews/schemas/review.schema";
import { createReview } from "@/features/reviews/services/review.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Só participantes do aluguel podem avaliar, e só depois de concluído (createReview verifica os
// dois no servidor, nunca confiando em um papel enviado pelo cliente).
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = reviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await createReview(session.user.id, id, parsed.data);

  if (result === "BOOKING_NOT_FOUND") {
    return apiError("BOOKING_NOT_FOUND", "Aluguel não encontrado.", 404);
  }
  if (result === "BOOKING_NOT_COMPLETED") {
    return apiError(
      "BOOKING_NOT_COMPLETED",
      "Só é possível avaliar depois que o aluguel for concluído.",
      409,
    );
  }
  if (result === "ALREADY_REVIEWED") {
    return apiError("ALREADY_REVIEWED", "Você já avaliou este aluguel.", 409);
  }

  return apiSuccess(result, { status: 201 });
}
