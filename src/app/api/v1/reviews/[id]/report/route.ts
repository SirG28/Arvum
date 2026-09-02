import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { reportReviewSchema } from "@/features/reviews/schemas/review.schema";
import { reportReview } from "@/features/reviews/services/review.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Qualquer usuário autenticado pode denunciar uma avaliação alheia — o autor é sempre descoberto
// no servidor (reportReview compara com a própria avaliação), nunca recebido do cliente.
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = reportReviewSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await reportReview(session.user.id, id, parsed.data.reason);

  if (result === "REVIEW_NOT_FOUND") {
    return apiError("REVIEW_NOT_FOUND", "Avaliação não encontrada.", 404);
  }
  if (result === "CANNOT_REPORT_OWN_REVIEW") {
    return apiError("CANNOT_REPORT_OWN_REVIEW", "Você não pode denunciar sua própria avaliação.", 403);
  }
  if (result === "ALREADY_MODERATED") {
    return apiError(
      "ALREADY_MODERATED",
      "Esta avaliação já está em análise da moderação ou foi removida.",
      409,
    );
  }

  return apiSuccess({ status: result });
}
