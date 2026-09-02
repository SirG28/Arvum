import { prisma } from "@/lib/prisma";
import { calculateAverageRating } from "../lib/rating";
import type { ReviewRequestInput } from "../schemas/review.schema";

export type CreateReviewResult =
  | Awaited<ReturnType<typeof prisma.review.create>>
  | "BOOKING_NOT_FOUND"
  | "BOOKING_NOT_COMPLETED"
  | "ALREADY_REVIEWED";

// Só participantes de um aluguel concluído podem avaliar, e cada lado avalia o outro uma única
// vez por aluguel (Context.md §8.14/§9.5). O papel de quem avalia é descoberto a partir do
// próprio aluguel (locatário ou proprietário da máquina), nunca recebido do cliente.
export async function createReview(
  authorId: string,
  bookingId: string,
  input: ReviewRequestInput,
): Promise<CreateReviewResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { machine: true },
  });
  if (!booking) return "BOOKING_NOT_FOUND";

  const isRenter = booking.renterId === authorId;
  const isOwner = booking.machine.ownerId === authorId;
  if (!isRenter && !isOwner) return "BOOKING_NOT_FOUND";

  if (booking.status !== "COMPLETED") return "BOOKING_NOT_COMPLETED";

  const existing = await prisma.review.findUnique({
    where: { bookingId_authorId: { bookingId, authorId } },
  });
  if (existing) return "ALREADY_REVIEWED";

  const targetUserId = isRenter ? booking.machine.ownerId : booking.renterId;

  return prisma.review.create({
    data: {
      bookingId,
      authorId,
      targetUserId,
      machineId: booking.machineId,
      rating: input.rating,
      // Estado do equipamento e experiência logística só fazem sentido do ponto de vista de quem
      // recebeu a máquina (Context.md §8.14: separar estado do equipamento, comunicação,
      // pontualidade e experiência logística) — o proprietário nunca preenche esses dois aspectos
      // ao avaliar o locatário.
      machineConditionRating: isRenter ? (input.machineConditionRating ?? null) : null,
      communicationRating: input.communicationRating ?? null,
      punctualityRating: input.punctualityRating ?? null,
      logisticsRating: isRenter ? (input.logisticsRating ?? null) : null,
      comment: input.comment || null,
    },
  });
}

// Avaliações publicadas de uma máquina, com nota média sempre recalculada a partir do conjunto
// atual (Context.md §9.5) — nunca um contador incremental guardado à parte. Só entram avaliações
// de quem alugou (target = proprietário): a avaliação do proprietário sobre o locatário é sobre a
// pessoa, não sobre o equipamento, e não deve inflar a nota pública do anúncio.
export async function getMachineReviews(machineId: string, ownerId: string) {
  const reviews = await prisma.review.findMany({
    where: { machineId, targetUserId: ownerId, status: "PUBLISHED" },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return {
    reviews,
    averageRating: calculateAverageRating(reviews.map((review) => review.rating)),
    count: reviews.length,
  };
}

export interface MachineRatingSummary {
  averageRating: number;
  count: number;
}

// Reputação da própria pessoa (Meu perfil) — soma avaliações recebidas como locatário e como
// proprietário num único número, já que a conta não separa os dois papéis (Context.md §8.1). Sem
// painel de moderação ainda (Fase 6), então também não há como o próprio usuário ocultar uma
// avaliação — só entram as já publicadas.
export async function getUserReviewSummary(userId: string) {
  const reviews = await prisma.review.findMany({
    where: { targetUserId: userId, status: "PUBLISHED" },
    select: { rating: true },
  });

  return {
    averageRating: calculateAverageRating(reviews.map((review) => review.rating)),
    count: reviews.length,
  };
}

// Últimas avaliações recebidas por um usuário (perfil próprio/público) — mesmo formato aceito por
// ReviewsSection.tsx, reaproveitado da página de detalhe da máquina. Diferente de lá, aqui as
// avaliações misturam os dois papéis da conta (Context.md §8.1: não há separação entre locatário e
// proprietário) — quem lê a lista precisa saber se foi avaliado como dono da máquina alugada ou
// como quem alugou, por isso "role" é derivado comparando o dono da máquina do aluguel com quem
// recebeu a avaliação (mesma regra usada para decidir targetUserId em createReview).
export async function getUserReviews(userId: string, limit = 5) {
  const reviews = await prisma.review.findMany({
    where: { targetUserId: userId, status: "PUBLISHED" },
    include: {
      author: { select: { id: true, name: true } },
      machine: { select: { ownerId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return reviews.map((review) => ({
    ...review,
    role: (review.machine.ownerId === userId ? "OWNER" : "RENTER") as "OWNER" | "RENTER",
  }));
}

export type ReportReviewResult = "OK" | "REVIEW_NOT_FOUND" | "CANNOT_REPORT_OWN_REVIEW" | "ALREADY_MODERATED";

// Qualquer usuário autenticado pode denunciar uma avaliação alheia (Context.md §9.5: "comentários
// denunciados podem ser ocultados pela moderação") — nunca a própria (createReview já impede
// autoavaliação, aqui é a mesma garantia do outro lado). Uma avaliação já denunciada ou já oculta
// não é denunciada de novo — evita fila de moderação com entradas duplicadas da mesma avaliação.
export async function reportReview(
  userId: string,
  reviewId: string,
  reason?: string,
): Promise<ReportReviewResult> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return "REVIEW_NOT_FOUND";
  if (review.authorId === userId) return "CANNOT_REPORT_OWN_REVIEW";
  if (review.status !== "PUBLISHED") return "ALREADY_MODERATED";

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: "REPORTED", reportReason: reason || null },
  });
  return "OK";
}

// Fila de moderação (Fase 6) — só avaliações denunciadas, nunca a base inteira de avaliações
// publicadas (isso seria o catálogo de avaliações, não uma fila de trabalho).
export async function listReportedReviews() {
  return prisma.review.findMany({
    where: { status: "REPORTED" },
    include: {
      author: { select: { id: true, name: true } },
      targetUser: { select: { id: true, name: true } },
      machine: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export type ModerateReviewResult = "OK" | "REVIEW_NOT_FOUND" | "NOT_REPORTED";

// Única forma de sair da fila de denúncias: ocultar (HIDDEN, para de contar na nota média e some
// da máquina/perfil) ou manter (volta a PUBLISHED, descartando a denúncia como improcedente) —
// nunca uma terceira opção que deixe a avaliação presa em REPORTED indefinidamente.
export async function moderateReview(
  reviewId: string,
  decision: "HIDE" | "RESTORE",
): Promise<ModerateReviewResult> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return "REVIEW_NOT_FOUND";
  if (review.status !== "REPORTED") return "NOT_REPORTED";

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: decision === "HIDE" ? "HIDDEN" : "PUBLISHED", reportReason: null },
  });
  return "OK";
}

// Nota média de várias máquinas de uma vez (catálogo) — uma única consulta em vez de N, mesmo
// cuidado de desempenho já aplicado ao restante da busca (Context.md §23). Mesma regra de
// getMachineReviews: só conta quem avaliou como locatário (target = proprietário da máquina).
export async function getAverageRatingsByMachineIds(
  machines: Array<{ id: string; ownerId: string }>,
): Promise<Map<string, MachineRatingSummary>> {
  if (machines.length === 0) return new Map();

  const reviews = await prisma.review.findMany({
    where: { machineId: { in: machines.map((machine) => machine.id) }, status: "PUBLISHED" },
    select: { machineId: true, targetUserId: true, rating: true },
  });

  const ownerByMachineId = new Map(machines.map((machine) => [machine.id, machine.ownerId]));
  const ratingsByMachineId = new Map<string, number[]>();
  for (const review of reviews) {
    if (review.targetUserId !== ownerByMachineId.get(review.machineId)) continue;
    const ratings = ratingsByMachineId.get(review.machineId) ?? [];
    ratings.push(review.rating);
    ratingsByMachineId.set(review.machineId, ratings);
  }

  const result = new Map<string, MachineRatingSummary>();
  for (const [machineId, ratings] of ratingsByMachineId) {
    result.set(machineId, { averageRating: calculateAverageRating(ratings)!, count: ratings.length });
  }
  return result;
}
