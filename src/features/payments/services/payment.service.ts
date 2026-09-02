import { prisma } from "@/lib/prisma";
import { isPaymentHoldExpired } from "@/features/bookings/lib/hold";
import type { PaymentMethod } from "../schemas/payment.schema";

export type ConfirmPaymentResult =
  | Awaited<ReturnType<typeof prisma.payment.create>>
  | "NOT_FOUND"
  | "NOT_AWAITING_PAYMENT"
  | "EXPIRED";

// Gateway simulado (Context.md §8.13/§27): sem integração real, sem dado de cartão coletado ou
// armazenado — resultado sempre aprovado, mesmo padrão determinístico dos demais adaptadores
// simulados do projeto (geocodificação, transporte por parceiro). Só o próprio locatário paga o
// seu aluguel, e só enquanto ele ainda estiver em AWAITING_PAYMENT (nasce assim, sem depender de
// nenhuma decisão manual do proprietário).
//
// Todo pedido segura a data por um prazo limitado (BOOKING_HOLD_TTL_MINUTES, lib/hold.ts) — se o
// locatário tentar pagar depois de expirado, cancelamos o aluguel aqui mesmo (sem job em
// background: a expiração só é aplicada quando alguém de fato tenta usar o pedido).
export async function confirmSimulatedPayment(
  renterId: string,
  bookingId: string,
  method: PaymentMethod,
): Promise<ConfirmPaymentResult> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.renterId !== renterId) return "NOT_FOUND";
  if (booking.status !== "AWAITING_PAYMENT") return "NOT_AWAITING_PAYMENT";

  if (isPaymentHoldExpired(booking.status, booking.createdAt)) {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", cancellationReason: "Prazo para pagamento expirado." },
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          previousStatus: "AWAITING_PAYMENT",
          nextStatus: "CANCELLED",
          changedById: renterId,
          notes: "Prazo para pagamento expirado.",
        },
      });
    });
    return "EXPIRED";
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        bookingId,
        amountInCents: booking.totalValueInCents,
        status: "APPROVED",
        paymentMethod: method,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({ where: { id: bookingId }, data: { status: "PAYMENT_CONFIRMED" } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        previousStatus: "AWAITING_PAYMENT",
        nextStatus: "PAYMENT_CONFIRMED",
        changedById: renterId,
        notes: "Pagamento confirmado (simulado). Aluguel confirmado.",
      },
    });

    return payment;
  });
}
