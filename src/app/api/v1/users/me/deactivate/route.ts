import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { deactivateUserAccount } from "@/features/users/services/user.service";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  await deactivateUserAccount(session.user.id);
  return apiSuccess({ status: "DEACTIVATED" });
}
