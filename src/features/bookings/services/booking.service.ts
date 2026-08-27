import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOwnedProperty } from "@/features/properties/services/property.service";
import { ACTIVE_BOOKING_STATUSES } from "@/features/machines/services/machine.service";
import { calculateDistanceKm } from "@/lib/geo/distance";
import { calculateLogisticsCost, type LogisticsCostResult } from "@/features/logistics/lib/pricing";
import { calculateOperationSupportCost } from "@/features/support/lib/pricing";
import { calculateRentalDays, calculateBookingTotals } from "../lib/pricing";
import {
  isBookingCancellableByRenter,
  isBookingCancellableByOwner,
  resolveCancellationRefund,
} from "../lib/cancellation";
import { getNextFulfillmentAction, FULFILLMENT_STEPS, type FulfillmentAction } from "../lib/fulfillment";
import type { BookingRequestInput } from "../schemas/booking.schema";

export function listBookingsByRenter(renterId: string) {
  return prisma.booking.findMany({
    where: { renterId },
    include: {
      machine: {
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Mesmo padrão de getOwnedProperty/getOwnedMachine: null tanto para "não existe" quanto para
// "existe mas não é do locatário" — nunca confiando no id vindo do cliente para decidir o que
// mostrar.
export async function getBookingForRenter(renterId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      machine: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          owner: { select: { id: true, name: true } },
        },
      },
      destinationProperty: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
      // Só a própria avaliação do locatário para esta reserva (Context.md §9.5: uma avaliação por
      // participante e por reserva) — usada para decidir entre mostrar o formulário ou o resultado
      // já enviado.
      reviews: { where: { authorId: renterId } },
    },
  });
  if (!booking || booking.renterId !== renterId) return null;
  return booking;
}

// Conta reservas que ainda ocupam o calendário (mesma lista usada para bloquear remoção de
// máquina e checar sobreposição) — proxy para "precisa de atenção do locatário": aguardando
// aprovação, aprovada mas sem pagamento, em transporte/uso etc. Estados finais (CANCELLED,
// REJECTED, COMPLETED) não contam.
export function countOpenBookingsByRenter(renterId: string) {
  return prisma.booking.count({
    where: { renterId, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
  });
}

// Equivalente do lado do proprietário: solicitações aguardando decisão (aprovar/recusar), a
// pendência mais urgente do painel do proprietário — usado tanto pelo indicador no cabeçalho
// (mesmo padrão de countOpenBookingsByRenter) quanto pela home logada.
export function countPendingBookingsForOwner(ownerId: string) {
  return prisma.booking.count({
    where: { machine: { ownerId }, status: "AWAITING_APPROVAL" },
  });
}

export type BookingQuoteError =
  | "MACHINE_NOT_FOUND"
  | "CANNOT_BOOK_OWN_MACHINE"
  | "PROPERTY_NOT_OWNED"
  | "RENTAL_PERIOD_TOO_SHORT"
  | "RENTAL_PERIOD_TOO_LONG"
  | "MACHINE_UNAVAILABLE"
  | "DELIVERY_OUT_OF_RANGE"
  | "DESTINATION_DISTANCE_UNKNOWN";

type MachineWithProperty = Prisma.MachineGetPayload<{ include: { property: true } }>;

export interface BookingQuote {
  machine: MachineWithProperty;
  destinationProperty: Prisma.PropertyGetPayload<Record<string, never>>;
  rentalDays: number;
  logisticsCost: LogisticsCostResult;
  operationSupportIncluded: boolean;
  totals: ReturnType<typeof calculateBookingTotals>;
  initialStatus: "APPROVED" | "AWAITING_APPROVAL";
}

// Toda a validação de negócio e o cálculo de valores (Context.md §8.8 passos 4–6: verificar
// disponibilidade, selecionar logística, calcular custos) vivem aqui — reaproveitado tanto pela
// prévia de preço (sem gravar nada) quanto pela criação real da reserva, para nunca haver dois
// lugares calculando o mesmo total de formas diferentes.
export async function buildBookingQuote(
  renterId: string,
  machineId: string,
  input: BookingRequestInput,
): Promise<BookingQuote | BookingQuoteError> {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: { property: true },
  });
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

  // Distância entre a propriedade da máquina e a propriedade de destino, mesma fórmula de
  // Haversine já usada pelo catálogo (src/lib/geo/distance.ts) — null quando alguma das duas
  // coordenadas não foi geocodificada.
  const distanceKm =
    machine.property.latitude != null &&
    machine.property.longitude != null &&
    destinationProperty.latitude != null &&
    destinationProperty.longitude != null
      ? calculateDistanceKm(
          { latitude: machine.property.latitude, longitude: machine.property.longitude },
          { latitude: destinationProperty.latitude, longitude: destinationProperty.longitude },
        )
      : null;

  const logisticsCost = calculateLogisticsCost({ mode: input.logisticsMode, distanceKm, machine });
  if (typeof logisticsCost === "string") return logisticsCost;

  const operationSupportValueInCents = calculateOperationSupportCost(input.operationSupportIncluded);

  const totals = calculateBookingTotals({
    rentalDays,
    dailyPriceInCents: machine.dailyPriceInCents,
    depositInCents: machine.depositInCents,
    logisticsValueInCents: logisticsCost.totalInCents,
    operationSupportValueInCents,
  });

  // Reserva instantânea pula a aprovação manual do proprietário (Context.md §8.8) — a decisão é
  // do anúncio (`machine.instantBooking`), nunca escolhida pelo locatário na hora de reservar.
  const initialStatus = machine.instantBooking ? "APPROVED" : "AWAITING_APPROVAL";

  return {
    machine,
    destinationProperty,
    rentalDays,
    logisticsCost,
    operationSupportIncluded: input.operationSupportIncluded,
    totals,
    initialStatus,
  };
}

export type CreateBookingResult =
  | Awaited<ReturnType<typeof prisma.booking.create>>
  | BookingQuoteError;

export async function createBookingRequest(
  renterId: string,
  machineId: string,
  input: BookingRequestInput,
): Promise<CreateBookingResult> {
  const quote = await buildBookingQuote(renterId, machineId, input);
  if (typeof quote === "string") return quote;

  const { machine, totals, logisticsCost, operationSupportIncluded, initialStatus } = quote;

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
        distanceKm: logisticsCost.distanceKm,
        operationSupportIncluded,
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

    // Retrato do cálculo logístico no momento da reserva (Context.md §8.11/§17) — já nasce
    // ACCEPTED porque, nesta etapa, não existe um fluxo separado de escolha entre cotações.
    await tx.logisticsQuote.create({
      data: {
        bookingId: booking.id,
        originPropertyId: machine.propertyId,
        destinationPropertyId: input.destinationPropertyId,
        mode: input.logisticsMode,
        distanceKm: logisticsCost.distanceKm,
        baseFeeInCents: logisticsCost.baseFeeInCents,
        pricePerKmInCents: logisticsCost.pricePerKmInCents,
        equipmentFactor: logisticsCost.equipmentFactor,
        totalInCents: logisticsCost.totalInCents,
        status: "ACCEPTED",
      },
    });

    return booking;
  });
}

// Espelha listBookingsByRenter, mas filtrando pela máquina em vez do locatário — a mesma reserva
// aparece nas duas listas (uma para cada lado da relação), nunca uma tabela própria de "pedidos".
export function listBookingsForOwner(ownerId: string) {
  return prisma.booking.findMany({
    where: { machine: { ownerId } },
    include: {
      machine: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      renter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Mesmo padrão de getBookingForRenter: null tanto para "não existe" quanto para "existe mas a
// máquina não é do proprietário logado" — nunca confiando no id vindo do cliente.
export async function getBookingForOwner(ownerId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      machine: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      destinationProperty: true,
      renter: { select: { id: true, name: true, email: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      // Só a própria avaliação do proprietário para esta reserva (Context.md §9.5: uma avaliação
      // por participante e por reserva) — usada para decidir entre mostrar o formulário ou o
      // resultado já enviado.
      reviews: { where: { authorId: ownerId } },
    },
  });
  if (!booking || booking.machine.ownerId !== ownerId) return null;
  return booking;
}

export type BookingDecisionResult = "APPROVED" | "REJECTED" | "NOT_FOUND" | "NOT_PENDING";

// Única transição possível pelo proprietário nesta etapa da Fase 4 (Context.md §8.8/§8.9):
// AWAITING_APPROVAL → APPROVED/REJECTED, sempre com histórico. Reserva instantânea nunca passa
// por aqui (nasce direto em APPROVED), então não há "reaprovar" uma reserva já decidida.
export async function decideBookingRequest(
  ownerId: string,
  bookingId: string,
  decision: "APPROVED" | "REJECTED",
  reason?: string,
): Promise<BookingDecisionResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { machine: true },
  });
  if (!booking || booking.machine.ownerId !== ownerId) return "NOT_FOUND";
  if (booking.status !== "AWAITING_APPROVAL") return "NOT_PENDING";

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: bookingId }, data: { status: decision } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        previousStatus: booking.status,
        nextStatus: decision,
        changedById: ownerId,
        notes:
          reason?.trim() ||
          (decision === "APPROVED" ? "Aprovada pelo proprietário." : "Recusada pelo proprietário."),
      },
    });
  });

  return decision;
}

export type CancelBookingResult =
  | { status: "CANCELLED"; refund: ReturnType<typeof resolveCancellationRefund> }
  | "NOT_FOUND"
  | "NOT_CANCELLABLE";

// Ponto único para cancelar uma reserva, tanto pelo locatário quanto pelo proprietário (Context.md
// §9.4) — o papel de quem está cancelando é descoberto a partir da própria reserva (nunca recebido
// do cliente), e cada papel tem sua janela permitida e política de estorno (isBookingCancellableBy*
// / resolveCancellationRefund, ambas em lib/cancellation.ts, nunca percentuais soltos aqui).
export async function cancelBooking(userId: string, bookingId: string): Promise<CancelBookingResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { machine: true, payments: true },
  });
  if (!booking) return "NOT_FOUND";

  const isOwner = booking.machine.ownerId === userId;
  const isRenter = booking.renterId === userId;
  if (!isOwner && !isRenter) return "NOT_FOUND";

  const cancelledBy = isRenter ? "RENTER" : "OWNER";
  const cancellable = isRenter
    ? isBookingCancellableByRenter(booking.status)
    : isBookingCancellableByOwner(booking.status);
  if (!cancellable) return "NOT_CANCELLABLE";

  const refund = resolveCancellationRefund(booking.status, booking.startDate, cancelledBy);
  const cancellationReason =
    cancelledBy === "RENTER" ? "Cancelada pelo locatário." : "Cancelada pelo proprietário.";

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancellationReason },
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        previousStatus: booking.status,
        nextStatus: "CANCELLED",
        changedById: userId,
        notes:
          refund === "FULL"
            ? `${cancellationReason} Pagamento estornado integralmente (simulado).`
            : cancellationReason,
      },
    });

    if (refund === "FULL") {
      const approvedPayment = booking.payments.find((payment) => payment.status === "APPROVED");
      if (approvedPayment) {
        await tx.payment.update({
          where: { id: approvedPayment.id },
          data: { status: "REFUNDED" },
        });
      }
    }
  });

  return { status: "CANCELLED", refund };
}

export type AdvanceFulfillmentResult =
  | { status: string }
  | "NOT_FOUND"
  | "INVALID_TRANSITION"
  | "FORBIDDEN";

// Ponto único para as transições pós-pagamento (Context.md §8.9): agendamento/transporte/entrega,
// uso e devolução. getNextFulfillmentAction (lib/fulfillment.ts) é a única fonte de verdade sobre
// qual é a próxima ação válida e de quem — aqui só verificamos que o usuário logado é de fato esse
// responsável (proprietário da máquina ou locatário da reserva) antes de aplicar a transição.
export async function advanceBookingFulfillment(
  userId: string,
  bookingId: string,
  action: FulfillmentAction,
): Promise<AdvanceFulfillmentResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { machine: true },
  });
  if (!booking) return "NOT_FOUND";

  const isOwner = booking.machine.ownerId === userId;
  const isRenter = booking.renterId === userId;
  if (!isOwner && !isRenter) return "NOT_FOUND";

  const expected = getNextFulfillmentAction(booking.status, booking.logisticsMode);
  if (!expected || expected.action !== action) return "INVALID_TRANSITION";

  const actorMatches = expected.actor === "OWNER" ? isOwner : isRenter;
  if (!actorMatches) return "FORBIDDEN";

  const steps = FULFILLMENT_STEPS[action];
  let finalStatus = booking.status;

  await prisma.$transaction(async (tx) => {
    let previousStatus = booking.status;
    for (const step of steps) {
      await tx.booking.update({ where: { id: bookingId }, data: { status: step.nextStatus } });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          previousStatus,
          nextStatus: step.nextStatus,
          changedById: userId,
          notes: step.notes,
        },
      });
      previousStatus = step.nextStatus;
      finalStatus = step.nextStatus;
    }
  });

  return { status: finalStatus };
}
