import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { changePasswordSchema } from "@/features/users/schemas/change-password.schema";
import { changeUserPassword } from "@/features/users/services/user.service";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await changeUserPassword(session.user.id, parsed.data);

  if (result === "INCORRECT_PASSWORD") {
    return apiError("INCORRECT_PASSWORD", "Senha atual incorreta.", 401);
  }

  return apiSuccess({ status: result });
}
