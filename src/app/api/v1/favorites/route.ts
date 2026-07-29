import { z } from "zod";
import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { addFavorite } from "@/features/favorites/services/favorite.service";

const addFavoriteSchema = z.object({
  machineId: z.string().trim().min(1, "Informe a máquina a favoritar."),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = addFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await addFavorite(session.user.id, parsed.data.machineId);

  if (result === "MACHINE_NOT_FOUND") {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  if (result === "ALREADY_FAVORITED") {
    return apiError("FAVORITE_ALREADY_EXISTS", "Esta máquina já está nos seus favoritos.", 409);
  }

  return apiSuccess(result, { status: 201 });
}
