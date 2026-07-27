import { z } from "zod";
import { MachineStatus } from "@prisma/client";
import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { changeMachineStatus } from "@/features/machines/services/machine.service";

const statusChangeSchema = z.object({
  status: z.nativeEnum(MachineStatus),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = statusChangeSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await changeMachineStatus(session.user.id, id, parsed.data.status);

  if (result === "NOT_FOUND") {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  if (result === "INVALID_TRANSITION") {
    return apiError(
      "MACHINE_INVALID_STATUS_TRANSITION",
      "Não é possível mudar para este status a partir do status atual.",
      409,
    );
  }
  if (result === "INCOMPLETE_LISTING") {
    return apiError(
      "MACHINE_INCOMPLETE_LISTING",
      "Cadastre ao menos uma imagem antes de publicar o anúncio.",
      422,
    );
  }

  return apiSuccess(result);
}
