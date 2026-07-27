import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { propertySchema } from "@/features/properties/schemas/property.schema";
import {
  createProperty,
  listPropertiesByOwner,
} from "@/features/properties/services/property.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const properties = await listPropertiesByOwner(session.user.id);
  return apiSuccess(properties);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const property = await createProperty(session.user.id, parsed.data);
  return apiSuccess(property, { status: 201 });
}
