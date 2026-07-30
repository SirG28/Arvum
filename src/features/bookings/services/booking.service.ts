import { prisma } from "@/lib/prisma";
import { getOwnedProperty } from "@/features/properties/services/property.service";
import { ACTIVE_BOOKING_STATUSES } from "@/features/machines/services/machine.service";
import { calculateRentalDays, calculateBookingTotals } from "../lib/pricing";
import type { BookingRequestInput } from "../schemas/booking.schema";

export type CreateBookingResult =
  | Awaited<ReturnType<typeof prisma.booking.create>>
  | "MACHINE_NOT_FOUND"
  | "CANNOT_BOOK_OWN_MACHINE"
  | "PROPERTY_NOT_OWNED"
  | "RENTAL_PERIOD_TOO_SHORT"
  | "RENTAL_PERIOD_TOO_LONG"
  | "MACHINE_UNAVAILABLE";

export async function createBookingRequest(
  renterId: string,
  machineId: string,
  input: BookingRequestInput,
): Promise<CreateBookingResult> {
  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!machine || machine.status !== "ACTIVE" || machine.deletedAt) return "MACHINE_NOT_FOUND";
  if (machine.ownerId === renterId) return "CANNOT_BOOK_OWN_MACHINE";

  const destinationProperty = await getOwnedProperty(renterId, input.destinationPropertyId);
  if (!destinationProperty) return "PROPERTY_NOT_OWNED";

  const rentalDays = calculateRentalDays(input.startDate, input.endDate);
  if (rentalDays < machine.minimumRentalDays) return "RENTAL_PERIOD_TOO_SHORT";
  if (machine.maximumRentalDays && rentalDays > machine.maximumRentalDays) {
    return "RENTAL_PERIOD_TOO_LONG";
  }

  // Mesma checagem de sobreposição usada pelos bloqueios manuais do proprietário
  // (machine-availability.service.ts), somada às reservas já em andamento — nunca confiando só
  // em uma das duas fontes.
  const [overlappingBlock, overlappingBooking] = await Promise.all([
    prisma.machineAvailability.findFirst({
      where: {
        machineId,
        startDate: { lt: input.endDate },
        endDate: { gt: input.startDate },
      },
    }),
    prisma.booking.findFirst({
      where: {
        machineId,
        status: { in: [...ACTIVE_BOOKING_STATUSES] },
        startDate: { lt: input.endDate },
        endDate: { gt: input.startDate },
      },
    }),
  ]);
  if (overlappingBlock || overlappingBooking) return "MACHINE_UNAVAILABLE";

  const totals = calculateBookingTotals({
    rentalDays,
    dailyPriceInCents: machine.dailyPriceInCents,
    depositInCents: machine.depositInCents,
  });

  // Reserva instantânea pula a aprovação manual do proprietário (Context.md §8.8) — a decisão é
  // do anúncio (`machine.instantBooking`), nunca escolhida pelo locatário na hora de reservar.
  const initialStatus = machine.instantBooking ? "APPROVED" : "AWAITING_APPROVAL";

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        machineId,
        renterId,
        destinationPropertyId: input.destinationPropertyId,
        startDate: input.startDate,
        endDate: input.endDate,
        status: initialStatus,
        logisticsMode: input.logisticsMode,
        notes: input.notes,
        ...totals,
      },
    });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        previousStatus: null,
        nextStatus: initialStatus,
        changedById: renterId,
        notes: "Solicitação de reserva criada.",
      },
    });

    return booking;
  });
}
