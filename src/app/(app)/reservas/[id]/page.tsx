import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getBookingForRenter } from "@/features/bookings/services/booking.service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BackLink } from "@/components/ui/BackLink";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_BADGE_TONE } from "@/features/bookings/lib/status-labels";
import { LOGISTICS_MODE_LABELS } from "@/features/bookings/lib/logistics-labels";
import { isBookingCancellableByRenter, resolveCancellationRefund } from "@/features/bookings/lib/cancellation";
import { getNextFulfillmentAction } from "@/features/bookings/lib/fulfillment";
import { PriceBreakdown } from "@/features/bookings/components/PriceBreakdown";
import { CancelBookingButton } from "@/features/bookings/components/CancelBookingButton";
import { FulfillmentActionButton } from "@/features/bookings/components/FulfillmentActionButton";
import { PaymentForm } from "@/features/payments/components/PaymentForm";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/lib/payment-method-labels";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { Rating } from "@/components/ui/Rating";

export const metadata = { title: "Detalhe da reserva" };

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/reservas/${id}`);

  const booking = await getBookingForRenter(user.id, id);
  if (!booking) notFound();

  const image = booking.machine.images[0];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <BackLink href="/reservas" label="Minhas reservas" />
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
              <dt className="text-neutral-400">Observações</dt>
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

      {booking.status === "APPROVED" && (
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">Pagamento</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Sua solicitação foi aprovada pelo proprietário. Confirme o pagamento para seguir com a
            reserva.
          </p>
          <PaymentForm className="mt-3" bookingId={booking.id} totalValueInCents={booking.totalValueInCents} />
        </Card>
      )}

      {(() => {
        const nextAction = getNextFulfillmentAction(booking.status, booking.logisticsMode);
        if (!nextAction || nextAction.actor !== "RENTER") return null;
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

      {booking.payments[0] && (
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">Pagamento confirmado</h2>
          <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-neutral-400">Forma de pagamento</dt>
              <dd className="text-neutral-900">
                {PAYMENT_METHOD_LABELS[booking.payments[0].paymentMethod as "CREDIT_CARD" | "PIX"] ??
                  booking.payments[0].paymentMethod}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">Pago em</dt>
              <dd className="text-neutral-900">
                {booking.payments[0].paidAt ? formatDateTime(booking.payments[0].paidAt) : "—"}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {booking.status === "COMPLETED" && (
        <Card>
          <h2 className="text-sm font-semibold text-neutral-900">Avaliação</h2>
          {booking.reviews[0] ? (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-sm text-neutral-500">Você já avaliou esta locação.</p>
              <Rating value={booking.reviews[0].rating} size="sm" />
              {booking.reviews[0].comment && (
                <p className="text-sm text-neutral-700">{booking.reviews[0].comment}</p>
              )}
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-neutral-500">
                Conte como foi alugar esta máquina de {booking.machine.owner.name}.
              </p>
              <ReviewForm
                className="mt-3"
                bookingId={booking.id}
                role="RENTER"
                targetName={booking.machine.owner.name}
              />
            </>
          )}
        </Card>
      )}

      <Link
        href={`/catalogo/${booking.machine.slug}`}
        className="text-sm font-medium text-neutral-700 underline hover:text-neutral-900"
      >
        Ver anúncio da máquina
      </Link>

      {isBookingCancellableByRenter(booking.status) && (
        <CancelBookingButton
          bookingId={booking.id}
          role="RENTER"
          refundOutcome={resolveCancellationRefund(booking.status, booking.startDate, "RENTER")}
        />
      )}
    </div>
  );
}
