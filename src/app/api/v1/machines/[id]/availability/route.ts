import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { machineAvailabilitySchema } from "@/features/machines/schemas/machine-availability.schema";
import { createBlock, listBlocks } from "@/features/machines/services/machine-availability.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const blocks = await listBlocks(session.user.id, id);
  if (blocks === null) {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  return apiSuccess(blocks);
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = machineAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await createBlock(session.user.id, id, parsed.data);
  if (result === null) {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  if (result === "OVERLAPS_EXISTING_BLOCK") {
    return apiError(
      "AVAILABILITY_OVERLAP",
      "Este período se sobrepõe a um bloqueio já existente.",
      409,
    );
  }
  return apiSuccess(result, { status: 201 });
}
