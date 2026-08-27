import type { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserReviewSummary } from "@/features/reviews/services/review.service";

// Status com pagamento confirmado (Context.md §8.9) — diferente de ACTIVE_BOOKING_STATUSES
// (machine.service.ts), que exclui COMPLETED e inclui status anteriores ao pagamento e não serve
// para "receita".
const PAID_BOOKING_STATUSES: BookingStatus[] = [
  "PAYMENT_CONFIRMED",
  "TRANSPORT_SCHEDULED",
  "IN_TRANSIT",
  "DELIVERED",
  "IN_USE",
  "AWAITING_RETURN",
  "RETURNED",
  "COMPLETED",
];

export interface OwnerPerformanceReport {
  bookingCountByStatus: Partial<Record<BookingStatus, number>>;
  totalRevenueInCents: number;
  averageRating: number | null;
  reviewCount: number;
}

// Relatório de desempenho do Plano Premium (Context.md §8.21) — usa só dados que já existem
// (reservas e avaliações), sem contagem de visualizações (não há tracking de página no projeto).
export async function getOwnerPerformanceReport(ownerId: string): Promise<OwnerPerformanceReport> {
  const [statusGroups, revenue, reviewSummary] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      where: { machine: { ownerId } },
      _count: true,
    }),
    prisma.booking.aggregate({
      where: { machine: { ownerId }, status: { in: PAID_BOOKING_STATUSES } },
      _sum: { totalValueInCents: true },
    }),
    getUserReviewSummary(ownerId),
  ]);

  const bookingCountByStatus: Partial<Record<BookingStatus, number>> = {};
  for (const group of statusGroups) {
    bookingCountByStatus[group.status] = group._count;
  }

  return {
    bookingCountByStatus,
    totalRevenueInCents: revenue._sum.totalValueInCents ?? 0,
    averageRating: reviewSummary.averageRating,
    reviewCount: reviewSummary.count,
  };
}
