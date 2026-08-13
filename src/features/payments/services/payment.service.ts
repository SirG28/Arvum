import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "../schemas/payment.schema";

export type ConfirmPaymentResult =
  | Awaited<ReturnType<typeof prisma.payment.create>>
  | "NOT_FOUND"
  | "NOT_APPROVED";

// Gateway simulado (Context.md §8.13/§27): sem integração real, sem dado de cartão coletado ou
// armazenado — resultado sempre aprovado, mesmo padrão determinístico dos demais adaptadores
// simulados do projeto (geocodificação, transporte por parceiro). Só o próprio locatário paga a
// sua reserva, e só quando ela já foi aprovada pelo proprietário (Context.md §8.8 passo 10: o
// pagamento vem depois da aprovação, nunca antes).
//
// A transição registra os dois estados do Context.md §8.9 (aguardando pagamento → pagamento
// confirmado) na mesma transação: como o "processamento" é instantâneo nesta simulação, não há
// uma espera real entre eles, mas o histórico preserva a sequência completa.
export async function confirmSimulatedPayment(
  renterId: string,
  bookingId: string,
  method: PaymentMethod,
): Promise<ConfirmPaymentResult> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.renterId !== renterId) return "NOT_FOUND";
  if (booking.status !== "APPROVED") return "NOT_APPROVED";

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

    await tx.booking.update({ where: { id: bookingId }, data: { status: "AWAITING_PAYMENT" } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        previousStatus: "APPROVED",
        nextStatus: "AWAITING_PAYMENT",
        changedById: renterId,
        notes: "Pagamento iniciado.",
      },
    });

    await tx.booking.update({ where: { id: bookingId }, data: { status: "PAYMENT_CONFIRMED" } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        previousStatus: "AWAITING_PAYMENT",
        nextStatus: "PAYMENT_CONFIRMED",
        changedById: renterId,
        notes: "Pagamento confirmado (simulado).",
      },
    });

    return payment;
  });
}
