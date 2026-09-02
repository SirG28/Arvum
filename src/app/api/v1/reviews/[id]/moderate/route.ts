import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { moderateReviewSchema } from "@/features/reviews/schemas/review.schema";
import { moderateReview } from "@/features/reviews/services/review.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Só administradores moderam (Context.md §5.4) — verificado no servidor a partir do papel da
// sessão, nunca confiando em uma tela escondida no cliente para restringir o acesso.
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }
  if (session.user.role !== "ADMIN") {
    return apiError("FORBIDDEN", "Apenas administradores podem moderar avaliações.", 403);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = moderateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await moderateReview(id, parsed.data.decision);

  if (result === "REVIEW_NOT_FOUND") {
    return apiError("REVIEW_NOT_FOUND", "Avaliação não encontrada.", 404);
  }
  if (result === "NOT_REPORTED") {
    return apiError("NOT_REPORTED", "Esta avaliação não está aguardando moderação.", 409);
  }

  return apiSuccess({ status: result });
}
