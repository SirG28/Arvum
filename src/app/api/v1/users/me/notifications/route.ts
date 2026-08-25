import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { notificationPreferencesSchema } from "@/features/users/schemas/notification-preferences.schema";
import { updateNotificationPreferences } from "@/features/users/services/user.service";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = notificationPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Dados inválidos.", 422, parsed.error.issues);
  }

  const result = await updateNotificationPreferences(session.user.id, parsed.data.notifyByEmail);
  return apiSuccess(result);
}
