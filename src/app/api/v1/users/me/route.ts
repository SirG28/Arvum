import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { profileSchema } from "@/features/users/schemas/profile.schema";
import { updateUserProfile } from "@/features/users/services/user.service";

// Só o próprio usuário edita o próprio perfil — não recebe id na rota de propósito, elimina
// qualquer risco de IDOR (nunca há um "id de outra pessoa" para tentar passar).
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await updateUserProfile(session.user.id, parsed.data);

  if (result === "DOCUMENT_ALREADY_USED") {
    return apiError(
      "DOCUMENT_ALREADY_USED",
      "Este número de documento já está cadastrado em outra conta.",
      409,
    );
  }

  return apiSuccess(result);
}
