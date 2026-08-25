import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getBookingForOwner } from "@/features/bookings/services/booking.service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_BADGE_TONE } from "@/features/bookings/lib/status-labels";
import { LOGISTICS_MODE_LABELS } from "@/features/bookings/lib/logistics-labels";
import { isBookingPendingApproval } from "@/features/bookings/lib/approval";
import { isBookingCancellableByOwner, resolveCancellationRefund } from "@/features/bookings/lib/cancellation";
import { getNextFulfillmentAction } from "@/features/bookings/lib/fulfillment";
import { PriceBreakdown } from "@/features/bookings/components/PriceBreakdown";
import { BookingDecisionActions } from "@/features/bookings/components/BookingDecisionActions";
import { CancelBookingButton } from "@/features/bookings/components/CancelBookingButton";
import { FulfillmentActionButton } from "@/features/bookings/components/FulfillmentActionButton";

export const metadata = { title: "Detalhe da solicitação" };

interface ReceivedBookingDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function ReceivedBookingDetailPage({ params }: ReceivedBookingDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/reservas/recebidas/${id}`);

  const booking = await getBookingForOwner(user.id, id);
  if (!booking) notFound();

  const image = booking.machine.images[0];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/reservas/recebidas" className="text-sm font-medium text-neutral-500 hover:text-neutral-700">
          ← Solicitações recebidas
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-neutral-900">{booking.machine.title}</h1>
          <Badge tone={BOOKING_STATUS_BADGE_TONE[booking.status]}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </Badge>
        </div>
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row">
        <div className="aspect-video w-full shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:w-48">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL arbitrária informada pelo proprietário, sem provedor de imagem configurado
            <img
              src={image.url}
              alt={image.altText ?? booking.machine.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
              Sem imagem
            </div>
          )}
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <dt className="text-neutral-400">Solicitado por</dt>
            <dd className="text-neutral-900">
              {booking.renter.name} — {booking.renter.email}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">Período</dt>
            <dd className="text-neutral-900">
              {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">Retirada/entrega</dt>
            <dd className="text-neutral-900">{LOGISTICS_MODE_LABELS[booking.logisticsMode]}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Destino</dt>
            <dd className="text-neutral-900">
              {booking.destinationProperty.name} — {booking.destinationProperty.city}/
              {booking.destinationProperty.state}
            </dd>
          </div>
          {booking.notes && (
            <div className="col-span-2">
              <dt className="text-neutral-400">Observações do locatário</dt>
              <dd className="text-neutral-900">{booking.notes}</dd>
            </div>
          )}
        </dl>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900">Valores</h2>
        <PriceBreakdown
          className="mt-3"
          rentalValueInCents={booking.rentalValueInCents}
          logisticsValueInCents={booking.logisticsValueInCents}
          serviceFeeInCents={booking.serviceFeeInCents}
          depositInCents={booking.depositInCents}
          discountInCents={booking.discountInCents}
          totalValueInCents={booking.totalValueInCents}
          distanceKm={booking.distanceKm}
          footnote="A taxa de serviço ainda é calculada como zero — chega nas próximas etapas da plataforma (comissão da Arvum)."
        />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-neutral-900">Andamento</h2>
        <ol className="mt-3 flex flex-col gap-3 text-sm">
          {booking.statusHistory.map((entry) => (
            <li key={entry.id} className="flex justify-between gap-4">
              <span className="text-neutral-900">{BOOKING_STATUS_LABELS[entry.nextStatus]}</span>
              <span className="shrink-0 text-neutral-400">{formatDateTime(entry.createdAt)}</span>
            </li>
          ))}
        </ol>
      </Card>

      {isBookingPendingApproval(booking.status) && <BookingDecisionActions bookingId={booking.id} />}

      {(() => {
        const nextAction = getNextFulfillmentAction(booking.status, booking.logisticsMode);
        if (!nextAction || nextAction.actor !== "OWNER") return null;
        return (
          <Card>
            <h2 className="text-sm font-semibold text-neutral-900">Próxima etapa</h2>
            <p className="mt-1 text-sm text-neutral-500">{nextAction.description}</p>
            <div className="mt-3">
              <FulfillmentActionButton bookingId={booking.id} action={nextAction} />
            </div>
          </Card>
        );
      })()}

      {isBookingCancellableByOwner(booking.status) && (
        <CancelBookingButton
          bookingId={booking.id}
          role="OWNER"
          refundOutcome={resolveCancellationRefund(booking.status, booking.startDate, "OWNER")}
        />
      )}
    </div>
  );
}
