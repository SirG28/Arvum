import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listBookingsForOwner } from "@/features/bookings/services/booking.service";
import { OwnerBookingListCard } from "@/features/bookings/components/OwnerBookingListCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Aluguéis recebidos" };

export default async function ReceivedRentalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/alugueis/recebidos");

  const bookings = await listBookingsForOwner(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Aluguéis recebidos</h1>
        <p className="text-sm text-neutral-500">Acompanhe os aluguéis das suas máquinas.</p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Você ainda não recebeu nenhum aluguel"
          description="Assim que alguém alugar uma de suas máquinas, o aluguel aparece aqui."
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
