import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listBookingsByRenter } from "@/features/bookings/services/booking.service";
import { BookingListCard } from "@/features/bookings/components/BookingListCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Minhas reservas" };

export default async function ReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/reservas");

  const bookings = await listBookingsByRenter(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Minhas reservas</h1>
        <p className="text-sm text-neutral-500">
          Acompanhe as máquinas que você solicitou, desde a aprovação do proprietário até a
          conclusão.
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Você ainda não tem nenhuma reserva"
          description="Encontre uma máquina no catálogo e solicite a reserva do período que precisar."
          action={
            <Link href="/catalogo">
              <Button>Ver catálogo</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <BookingListCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
