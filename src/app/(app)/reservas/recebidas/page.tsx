import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listBookingsForOwner } from "@/features/bookings/services/booking.service";
import { OwnerBookingListCard } from "@/features/bookings/components/OwnerBookingListCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Solicitações recebidas" };

export default async function ReceivedBookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/reservas/recebidas");

  const bookings = await listBookingsForOwner(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Solicitações recebidas</h1>
        <p className="text-sm text-neutral-500">
          Acompanhe e decida os pedidos de reserva das suas máquinas.
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Você ainda não recebeu nenhuma solicitação"
          description="Assim que alguém solicitar uma de suas máquinas, a solicitação aparece aqui."
          action={
            <Link href="/maquinas">
              <Button>Ver minhas máquinas</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <OwnerBookingListCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
