import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { removeFavorite } from "@/features/favorites/services/favorite.service";

interface RouteParams {
  params: Promise<{ machineId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { machineId } = await params;
  const result = await removeFavorite(session.user.id, machineId);

  if (result === "NOT_FOUND") {
    return apiError("FAVORITE_NOT_FOUND", "Este favorito não existe.", 404);
  }

  return apiSuccess({ removed: true });
}
