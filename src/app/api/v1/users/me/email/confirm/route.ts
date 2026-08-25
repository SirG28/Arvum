import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { confirmEmailChangeSchema } from "@/features/users/schemas/change-email.schema";
import { confirmEmailChange } from "@/features/users/services/user.service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = confirmEmailChangeSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await confirmEmailChange(session.user.id, parsed.data.token);

  if (result === "INVALID_TOKEN") {
    return apiError("INVALID_TOKEN", "Token de confirmação inválido.", 400);
  }
  if (result === "EXPIRED") {
    return apiError(
      "EXPIRED",
      "A confirmação expirou. Solicite a troca de e-mail novamente.",
      410,
    );
  }

  return apiSuccess(result);
}
