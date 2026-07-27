import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { propertySchema } from "@/features/properties/schemas/property.schema";
import {
  deleteProperty,
  getOwnedProperty,
  updateProperty,
} from "@/features/properties/services/property.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const property = await getOwnedProperty(session.user.id, id);
  if (!property) {
    return apiError("PROPERTY_NOT_FOUND", "Propriedade não encontrada.", 404);
  }
  return apiSuccess(property);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const updated = await updateProperty(session.user.id, id, parsed.data);
  if (!updated) {
    return apiError("PROPERTY_NOT_FOUND", "Propriedade não encontrada.", 404);
  }
  return apiSuccess(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const { id } = await params;
  const result = await deleteProperty(session.user.id, id);

  if (result === null) {
    return apiError("PROPERTY_NOT_FOUND", "Propriedade não encontrada.", 404);
  }
  if (result === "HAS_DEPENDENCIES") {
    return apiError(
      "PROPERTY_HAS_MACHINES",
      "Não é possível remover: existem máquinas vinculadas a esta propriedade.",
      409,
    );
  }
  return apiSuccess({ deleted: true });
}
