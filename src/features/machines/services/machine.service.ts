import type { Machine, MachineStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOwnedProperty } from "@/features/properties/services/property.service";
import { mockGeocodingProvider } from "@/lib/geo/geocoding";
import { calculateDistanceKm, type GeoPoint } from "@/lib/geo/distance";
import { getAverageRatingsByMachineIds } from "@/features/reviews/services/review.service";
import { isPremiumActive } from "@/features/subscriptions/lib/subscription-status";
import { generateMachineSlug } from "../lib/slug";
import { canTransitionMachineStatus } from "../lib/machine-status";
import { toMachinePersistedData, type MachineFormOutput } from "../schemas/machine.schema";
import { sortByPremiumFirst } from "../lib/premium-boost";

// Reservas nestes status ainda impedem a remoção definitiva da máquina (§9.2) e contam como
// ocupação real do calendário (bookings.service.ts reusa esta lista para checar sobreposição).
// CANCELLED e COMPLETED são estados finais e não bloqueiam.
export const ACTIVE_BOOKING_STATUSES = [
  "DRAFT",
  "AWAITING_APPROVAL",
  "APPROVED",
  "AWAITING_PAYMENT",
  "PAYMENT_CONFIRMED",
  "TRANSPORT_SCHEDULED",
  "IN_TRANSIT",
  "DELIVERED",
  "IN_USE",
  "AWAITING_RETURN",
] as const;

export async function listMachinesByOwner(ownerId: string) {
  return prisma.machine.findMany({
    where: { ownerId, deletedAt: null },
    include: {
      category: true,
      property: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Só para decidir se o indicador de "Solicitações recebidas" aparece no header (OwnerRequestsIndicator.tsx)
// — mostrar esse atalho pra quem nunca anunciou nada é ruído permanente sem nenhuma utilidade,
// já que essa conta nunca vai ter uma solicitação pra aprovar. findFirst (não count): só existência
// importa aqui, sem motivo pra contar todas as linhas.
export function hasOwnerMachines(ownerId: string) {
  return prisma.machine
    .findFirst({ where: { ownerId, deletedAt: null }, select: { id: true } })
    .then((machine) => machine !== null);
}

// Só para a chamada de ROI do Plano Premium (SubscriptionCard.tsx) a quem ainda não assina —
// um único número (a maior diária já anunciada), nunca o relatório de desempenho completo, que é
// benefício exclusivo de quem já é Premium (PREMIUM_BENEFITS, subscriptions/config.ts).
export async function getOwnerHighestDailyPriceInCents(ownerId: string) {
  const result = await prisma.machine.aggregate({
    where: { ownerId, deletedAt: null },
    _max: { dailyPriceInCents: true },
  });
  return result._max.dailyPriceInCents;
}

export type CreateMachineResult = Machine | "PROPERTY_NOT_OWNED";

export async function createMachine(
  ownerId: string,
  input: MachineFormOutput,
): Promise<CreateMachineResult> {
  const property = await getOwnedProperty(ownerId, input.propertyId);
  if (!property) return "PROPERTY_NOT_OWNED";

  return prisma.machine.create({
    data: {
      ...toMachinePersistedData(input),
      ownerId,
      slug: generateMachineSlug(input.title),
    },
  });
}

export async function getOwnedMachine(ownerId: string, machineId: string) {
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: {
      images: { orderBy: { position: "asc" } },
      availability: { orderBy: { startDate: "asc" } },
    },
  });
  if (!machine || machine.ownerId !== ownerId || machine.deletedAt) return null;
  return machine;
}

export type UpdateMachineResult = Machine | "NOT_FOUND" | "PROPERTY_NOT_OWNED";

export async function updateMachine(
  ownerId: string,
  machineId: string,
  input: MachineFormOutput,
): Promise<UpdateMachineResult> {
  const existing = await getOwnedMachine(ownerId, machineId);
  if (!existing) return "NOT_FOUND";

  const property = await getOwnedProperty(ownerId, input.propertyId);
  if (!property) return "PROPERTY_NOT_OWNED";

  return prisma.machine.update({
    where: { id: machineId },
    data: toMachinePersistedData(input),
  });
}

export type ChangeMachineStatusResult =
  | Machine
  | "NOT_FOUND"
  | "INVALID_TRANSITION"
  | "INCOMPLETE_LISTING";

export async function changeMachineStatus(
  ownerId: string,
  machineId: string,
  nextStatus: MachineStatus,
): Promise<ChangeMachineStatusResult> {
  const machine = await getOwnedMachine(ownerId, machineId);
  if (!machine) return "NOT_FOUND";

  if (!canTransitionMachineStatus(machine.status, nextStatus)) {
    return "INVALID_TRANSITION";
  }

  if (nextStatus === "ACTIVE" && machine.images.length === 0) {
    return "INCOMPLETE_LISTING";
  }

  return prisma.machine.update({ where: { id: machineId }, data: { status: nextStatus } });
}

export type SoftDeleteMachineResult = "DELETED" | "HAS_ACTIVE_BOOKINGS" | null;

export async function softDeleteMachine(
  ownerId: string,
  machineId: string,
): Promise<SoftDeleteMachineResult> {
  const machine = await getOwnedMachine(ownerId, machineId);
  if (!machine) return null;

  const activeBookings = await prisma.booking.count({
    where: { machineId, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
  });
  if (activeBookings > 0) return "HAS_ACTIVE_BOOKINGS";

  await prisma.machine.update({
    where: { id: machineId },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
  return "DELETED";
}

interface CatalogFilters {
  categorySlug?: string;
  search?: string;
  priceMaxInCents?: number;
  // Período desejado pelo locatário: exclui máquinas com bloqueio manual sobreposto. Reservas
  // (Fase 4) ainda não existem, então não há confirmação a considerar aqui além dos bloqueios.
  availableFrom?: Date;
  availableTo?: Date;
  // Localização informada pelo locatário ("onde será utilizada") — usada para calcular a
  // distância estimada até cada máquina e, opcionalmente, filtrar por um raio máximo.
  originCity?: string;
  originState?: string;
  maxDistanceKm?: number;
}

// Anexa a distância estimada (km) até `origin`, quando informada e a propriedade da máquina tiver
// coordenadas. Não recorre a nenhuma API externa — cálculo puro sobre coordenadas já geocodificadas
// (§8.11 do Context.md pede exatamente essa separação entre cálculo e origem do dado).
function withDistanceFromOrigin<T extends { property: { latitude: number | null; longitude: number | null } }>(
  machines: T[],
  origin: GeoPoint | null,
): (T & { distanceKm: number | null })[] {
  return machines.map((machine) => ({
    ...machine,
    distanceKm:
      origin && machine.property.latitude != null && machine.property.longitude != null
        ? calculateDistanceKm(origin, {
            latitude: machine.property.latitude,
            longitude: machine.property.longitude,
          })
        : null,
  }));
}

export async function listActiveMachines(filters: CatalogFilters = {}) {
  const hasPeriod = filters.availableFrom && filters.availableTo;

  const machines = await prisma.machine.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
      // Um único campo de busca cobre o que antes eram filtros dedicados de marca/cultura/
      // finalidade — casa com título, marca, finalidade (contains) e culturas recomendadas
      // (match exato de tag, já que é uma lista de strings curtas, não texto livre).
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { brand: { contains: filters.search, mode: "insensitive" } },
              { purpose: { contains: filters.search, mode: "insensitive" } },
              { recommendedCrops: { has: filters.search } },
            ],
          }
        : {}),
      ...(filters.priceMaxInCents !== undefined
        ? { dailyPriceInCents: { lte: filters.priceMaxInCents } }
        : {}),
      ...(hasPeriod
        ? {
            availability: {
              none: {
                type: "MANUAL_BLOCK",
                startDate: { lt: filters.availableTo },
                endDate: { gt: filters.availableFrom },
              },
            },
            bookings: {
              none: {
                status: { in: [...ACTIVE_BOOKING_STATUSES] },
                startDate: { lt: filters.availableTo },
                endDate: { gt: filters.availableFrom },
              },
            },
          }
        : {}),
    },
    include: {
      category: true,
      property: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      owner: { select: { subscription: { select: { currentPeriodEnd: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const origin =
    filters.originCity && filters.originState
      ? mockGeocodingProvider.geocode({ city: filters.originCity, state: filters.originState })
      : null;

  const withDistance = withDistanceFromOrigin(machines, origin);

  const filtered =
    filters.maxDistanceKm !== undefined
      ? withDistance.filter((machine) => machine.distanceKm !== null && machine.distanceKm <= filters.maxDistanceKm!)
      : withDistance;

  if (origin) {
    filtered.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  // Nota média por máquina (Context.md §8.5: resultados devem exibir nota média) — uma única
  // consulta para toda a página em vez de uma por máquina.
  const ratings = await getAverageRatingsByMachineIds(
    filtered.map((machine) => ({ id: machine.id, ownerId: machine.ownerId })),
  );
  const withRatings = filtered.map((machine) => ({
    ...machine,
    averageRating: ratings.get(machine.id)?.averageRating ?? null,
    reviewCount: ratings.get(machine.id)?.count ?? 0,
    ownerHasPremium: isPremiumActive(machine.owner.subscription),
  }));

  // Destaque de parceiros Premium (Context.md §8.21): reordena colocando quem tem assinatura
  // ativa primeiro, sem descartar a ordenação por distância/data já aplicada acima (sort estável).
  return sortByPremiumFirst(withRatings, (machine) => machine.ownerHasPremium);
}

// Vitrine de anúncios no perfil público/próprio do vendedor — mesmo critério de "publicamente
// visível" de listActiveMachines (status ACTIVE, não removida), sem os filtros e o cálculo de
// distância que só fazem sentido na busca do catálogo. Devolve o mesmo formato que
// CatalogMachineCard já espera, para reaproveitar o componente sem adaptação.
export async function listActiveMachinesByOwner(ownerId: string) {
  const machines = await prisma.machine.findMany({
    where: { ownerId, status: "ACTIVE", deletedAt: null },
    include: {
      category: true,
      property: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      owner: { select: { subscription: { select: { currentPeriodEnd: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const ratings = await getAverageRatingsByMachineIds(
    machines.map((machine) => ({ id: machine.id, ownerId: machine.ownerId })),
  );

  return machines.map((machine) => ({
    ...machine,
    distanceKm: null,
    averageRating: ratings.get(machine.id)?.averageRating ?? null,
    reviewCount: ratings.get(machine.id)?.count ?? 0,
    ownerHasPremium: isPremiumActive(machine.owner.subscription),
  }));
}

export async function getPublicMachineBySlug(
  slug: string,
  origin?: { city: string; state: string },
) {
  const machine = await prisma.machine.findUnique({
    where: { slug },
    include: {
      category: true,
      property: true,
      owner: {
        select: { id: true, name: true, subscription: { select: { currentPeriodEnd: true } } },
      },
      images: { orderBy: { position: "asc" } },
      availability: { orderBy: { startDate: "asc" } },
    },
  });
  if (!machine || machine.status !== "ACTIVE" || machine.deletedAt) return null;

  const originPoint = origin ? mockGeocodingProvider.geocode(origin) : null;
  return withDistanceFromOrigin([machine], originPoint)[0];
}
