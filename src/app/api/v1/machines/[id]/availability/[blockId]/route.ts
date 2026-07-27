import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { removeBlock } from "@/features/machines/services/machine-availability.service";

interface RouteParams {
  params: Promise<{ id: string; blockId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id, blockId } = await params;
  const result = await removeBlock(session.user.id, id, blockId);
  if (result === null) {
    return apiError("AVAILABILITY_BLOCK_NOT_FOUND", "Bloqueio não encontrado.", 404);
  }
  return apiSuccess({ deleted: true });
}
