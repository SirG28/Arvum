import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requestDataDeletion } from "@/features/users/services/user.service";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const result = await requestDataDeletion(session.user.id);
  return apiSuccess(result);
}
