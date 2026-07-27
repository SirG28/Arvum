import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { machineSchema, normalizeMachinePayload } from "@/features/machines/schemas/machine.schema";
import { createMachine, listMachinesByOwner } from "@/features/machines/services/machine.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const machines = await listMachinesByOwner(session.user.id);
  return apiSuccess(machines);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = machineSchema.safeParse(normalizeMachinePayload(body));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await createMachine(session.user.id, parsed.data);
  if (result === "PROPERTY_NOT_OWNED") {
    return apiError(
      "PROPERTY_NOT_OWNED",
      "A propriedade informada não pertence a este usuário.",
      403,
    );
  }

  return apiSuccess(result, { status: 201 });
}
