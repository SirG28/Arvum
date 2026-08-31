import { auth } from "@/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { countPendingBookingsForOwner } from "@/features/bookings/services/booking.service";
import { hasOwnerMachines } from "@/features/machines/services/machine.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError("UNAUTHENTICATED", "Faça login para continuar.", 401);
  }

  // hasMachines viaja junto (mesma requisição) porque é o que decide se o indicador de
  // "Solicitações recebidas" aparece no header — ver OwnerRequestsIndicator.tsx.
  const [count, hasMachines] = await Promise.all([
    countPendingBookingsForOwner(session.user.id),
    hasOwnerMachines(session.user.id),
  ]);
  return apiSuccess({ count, hasMachines });
}
