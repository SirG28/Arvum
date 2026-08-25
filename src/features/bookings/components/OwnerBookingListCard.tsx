import Link from "next/link";
import type { Booking, Machine, MachineImage, User } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_BADGE_TONE } from "../lib/status-labels";

type BookingWithDetails = Booking & {
  machine: Machine & { images: MachineImage[] };
  renter: Pick<User, "id" | "name" | "email">;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Espelha BookingListCard (visão do locatário), mas mostra quem solicitou em vez de aparecer só a
// máquina, e aponta para /reservas/recebidas/[id] em vez de /reservas/[id] — telas de detalhe
// distintas porque as ações disponíveis (aprovar/recusar vs. cancelar) dependem de qual lado da
// reserva está logado.
export function OwnerBookingListCard({ booking }: { booking: BookingWithDetails }) {
  const image = booking.machine.images[0];

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="aspect-video w-full shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:w-40">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL arbitrária informada pelo proprietário, sem provedor de imagem configurado
          <img
            src={image.url}
            alt={image.altText ?? booking.machine.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">Sem imagem</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">{booking.machine.title}</h3>
          <Badge tone={BOOKING_STATUS_BADGE_TONE[booking.status]}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </Badge>
        </div>
        <p className="text-sm text-neutral-500">Solicitado por {booking.renter.name}</p>
        <p className="text-sm text-neutral-500">
          {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
        </p>
        <p className="text-primary-700 text-sm font-medium">{formatBRL(booking.totalValueInCents)}</p>
        <Link
          href={`/reservas/recebidas/${booking.id}`}
          className="mt-1 text-sm font-medium text-neutral-700 underline hover:text-neutral-900"
        >
          Ver detalhes da solicitação
        </Link>
      </div>
    </Card>
  );
}
