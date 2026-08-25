import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { changeEmailRequestSchema } from "@/features/users/schemas/change-email.schema";
import { requestEmailChange, cancelEmailChange } from "@/features/users/services/user.service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = changeEmailRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await requestEmailChange(session.user.id, parsed.data);

  if (result === "INCORRECT_PASSWORD") {
    return apiError("INCORRECT_PASSWORD", "Senha atual incorreta.", 401);
  }
  if (result === "EMAIL_ALREADY_USED") {
    return apiError("EMAIL_ALREADY_USED", "Este e-mail já está em uso por outra conta.", 409);
  }
  if (result === "SAME_EMAIL") {
    return apiError("SAME_EMAIL", "Este já é o seu e-mail atual.", 409);
  }

  return apiSuccess(result, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const result = await cancelEmailChange(session.user.id);
  return apiSuccess(result);
}
