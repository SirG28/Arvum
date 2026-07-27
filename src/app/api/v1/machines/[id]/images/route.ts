import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { machineImageSchema } from "@/features/machines/schemas/machine-image.schema";
import { addImage, listImages } from "@/features/machines/services/machine-image.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const images = await listImages(session.user.id, id);
  if (images === null) {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  return apiSuccess(images);
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = machineImageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const image = await addImage(session.user.id, id, parsed.data);
  if (image === null) {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  return apiSuccess(image, { status: 201 });
}
