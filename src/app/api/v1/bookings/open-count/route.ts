import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { countOpenBookingsByRenter } from "@/features/bookings/services/booking.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  const count = await countOpenBookingsByRenter(session.user.id);
  return apiSuccess({ count });
}
