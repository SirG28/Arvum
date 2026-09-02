import { z } from "zod";
import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { machineSchema, normalizeMachinePayload } from "@/features/machines/schemas/machine.schema";
import { createMachine, listMachinesByOwner } from "@/features/machines/services/machine.service";

// Fotos escolhidas na etapa "Fotos" do assistente de criação (MachineForm.tsx) — data URLs já
// redimensionados no navegador, nunca uma URL arbitrária digitada. Fora de machineSchema de
// propósito: não é um campo do formulário via react-hook-form, é estado local enviado à parte no
// mesmo corpo da requisição.
const createMachineImagesSchema = z
  .array(z.string().trim().url("Imagem inválida."))
  .max(8, "Envie no máximo 8 imagens.")
  .optional();

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
  const { images: rawImages, ...machineFields } = (body ?? {}) as Record<string, unknown>;

  const parsed = machineSchema.safeParse(normalizeMachinePayload(machineFields));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const parsedImages = createMachineImagesSchema.safeParse(rawImages);
  if (!parsedImages.success) {
    return apiError("VALIDATION_ERROR", "Imagens inválidas.", 422, parsedImages.error.issues);
  }

  const result = await createMachine(session.user.id, parsed.data, parsedImages.data);
  if (result === "PROPERTY_NOT_OWNED") {
    return apiError(
      "PROPERTY_NOT_OWNED",
      "A propriedade informada não pertence a este usuário.",
      403,
    );
  }

  return apiSuccess(result, { status: 201 });
}
