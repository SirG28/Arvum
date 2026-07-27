import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { removeImage } from "@/features/machines/services/machine-image.service";

interface RouteParams {
  params: Promise<{ id: string; imageId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id, imageId } = await params;
  const result = await removeImage(session.user.id, id, imageId);
  if (result === null) {
    return apiError("MACHINE_IMAGE_NOT_FOUND", "Imagem não encontrada.", 404);
  }
  return apiSuccess({ deleted: true });
}
