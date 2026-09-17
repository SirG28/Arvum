import { prisma } from "@/lib/prisma";
import type { SendMessageInput } from "../schemas/message.schema";

export type SendMessageResult = Awaited<ReturnType<typeof prisma.message.create>> | "BOOKING_NOT_FOUND";

// Só participantes do aluguel (locatário ou proprietário da máquina) trocam mensagens sobre ele —
// o papel é descoberto a partir do próprio Booking, nunca recebido do cliente, mesmo padrão de
// createReview/cancelBooking. Quem não participou recebe o mesmo "BOOKING_NOT_FOUND" de quem
// manda um id inexistente, nunca um 403 — não revela a existência do aluguel a quem é estranho a
// ele.
export async function sendMessage(
  senderId: string,
  bookingId: string,
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { machine: { select: { ownerId: true } } },
  });
  if (!booking) return "BOOKING_NOT_FOUND";

  const isParticipant = booking.renterId === senderId || booking.machine.ownerId === senderId;
  if (!isParticipant) return "BOOKING_NOT_FOUND";

  return prisma.message.create({
    data: { bookingId, senderId, body: input.body },
  });
}
