import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { machineSchema, normalizeMachinePayload } from "@/features/machines/schemas/machine.schema";
import {
  getOwnedMachine,
  softDeleteMachine,
  updateMachine,
} from "@/features/machines/services/machine.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const machine = await getOwnedMachine(session.user.id, id);
  if (!machine) {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  return apiSuccess(machine);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = machineSchema.safeParse(normalizeMachinePayload(body));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await updateMachine(session.user.id, id, parsed.data);
  if (result === "NOT_FOUND") {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  if (result === "PROPERTY_NOT_OWNED") {
    return apiError(
      "PROPERTY_NOT_OWNED",
      "A propriedade informada não pertence a este usuário.",
      403,
    );
  }

  return apiSuccess(result);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const result = await softDeleteMachine(session.user.id, id);

  if (result === null) {
    return apiError("MACHINE_NOT_FOUND", "Máquina não encontrada.", 404);
  }
  if (result === "HAS_ACTIVE_BOOKINGS") {
    return apiError(
      "MACHINE_HAS_ACTIVE_BOOKINGS",
      "Não é possível remover: existem reservas ativas para esta máquina.",
      409,
    );
  }
  return apiSuccess({ deleted: true });
}
