import type { Machine, MachineStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BOOKING_HOLD_TTL_MINUTES } from "@/features/bookings/lib/hold";
import { getOwnedProperty } from "@/features/properties/services/property.service";
import { mockGeocodingProvider } from "@/lib/geo/geocoding";
import { calculateDistanceKm, type GeoPoint } from "@/lib/geo/distance";
import { getAverageRatingsByMachineIds } from "@/features/reviews/services/review.service";
import { isPremiumActive } from "@/features/subscriptions/lib/subscription-status";
import { generateMachineSlug } from "../lib/slug";
import { canTransitionMachineStatus } from "../lib/machine-status";
import { toMachinePersistedData, type MachineFormOutput } from "../schemas/machine.schema";
import { sortByPremiumFirst } from "../lib/premium-boost";

// Aluguéis nestes status ainda impedem a remoção definitiva da máquina (§9.2) e contam como
// ocupação real do calendário (booking.service.ts reusa esta lista para checar sobreposição).
// CANCELLED e COMPLETED são estados finais e não bloqueiam.
export const ACTIVE_BOOKING_STATUSES = [
  "AWAITING_PAYMENT",
  "PAYMENT_CONFIRMED",
  "TRANSPORT_SCHEDULED",
  "IN_TRANSIT",
  "DELIVERED",
  "IN_USE",
  "AWAITING_RETURN",
] as const;

// Mesma lista acima, exceto AWAITING_PAYMENT: um pedido nasce bloqueando a agenda para evitar dois
// locatários pagando pelo mesmo período, mas esse bloqueio não pode durar para sempre se ninguém
// pagar — por isso só conta como ativo dentro do prazo de BOOKING_HOLD_TTL_MINUTES (hold.ts). Sem
// job em background: o corte é recalculado a cada consulta, nunca escrito no banco por um processo
// separado.
export function activeBookingStatusFilter(now: Date = new Date()): Prisma.BookingWhereInput {
  const cutoff = new Date(now.getTime() - BOOKING_HOLD_TTL_MINUTES * 60_000);
  return {
    OR: [
      {
        status: {
          in: [
            "PAYMENT_CONFIRMED",
            "TRANSPORT_SCHEDULED",
            "IN_TRANSIT",
            "DELIVERED",
            "IN_USE",
            "AWAITING_RETURN",
          ],
        },
      },
      { status: "AWAITING_PAYMENT", createdAt: { gte: cutoff } },
    ],
  };
}

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

// Só para decidir se o convite pra virar proprietário aparece no detalhe de um aluguel concluído
// (alugueis/[id]/page.tsx) — mostrar esse convite pra quem já anuncia máquinas é ruído permanente
// sem nenhuma utilidade. Máquina em rascunho não conta: ainda não foi publicada (nunca apareceu no
// catálogo), então não existe locatário que possa ter alugado ela. findFirst (não count): só
// existência importa aqui, sem motivo pra contar todas as linhas.
export function hasOwnerMachines(ownerId: string) {
  return prisma.machine
    .findFirst({
      where: { ownerId, deletedAt: null, status: { not: "DRAFT" } },
      select: { id: true },
    })
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

// `imageUrls` vem do assistente de criação (MachineForm.tsx, etapa "Fotos") — data URLs já
// redimensionados no navegador, não uma URL colada manualmente. O create aninhado do Prisma grava
// máquina e imagens numa única operação atômica, sem precisar de um `$transaction` explícito nem
// de um machineId prévio (que ainda não existiria neste ponto).
export async function createMachine(
  ownerId: string,
  input: MachineFormOutput,
  imageUrls: string[] = [],
): Promise<CreateMachineResult> {
  const property = await getOwnedProperty(ownerId, input.propertyId);
  if (!property) return "PROPERTY_NOT_OWNED";

  return prisma.machine.create({
    data: {
      ...toMachinePersistedData(input),
      ownerId,
      slug: generateMachineSlug(input.title),
      images:
        imageUrls.length > 0
          ? { create: imageUrls.map((url, position) => ({ url, position })) }
          : undefined,
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
    where: { machineId, ...activeBookingStatusFilter() },
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
  // Período desejado pelo locatário: exclui máquinas com bloqueio manual sobreposto ou com um
  // aluguel ativo sobreposto (activeBookingStatusFilter, abaixo).
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

export const CATALOG_PAGE_SIZE = 12;

interface CatalogPagination {
  page?: number;
  pageSize?: number;
}

function buildActiveMachinesWhere(filters: CatalogFilters) {
  const hasPeriod = filters.availableFrom && filters.availableTo;

  return {
    status: "ACTIVE" as const,
    deletedAt: null,
    ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
    // Um único campo de busca cobre o que antes eram filtros dedicados de marca/cultura/
    // finalidade — casa com título, marca, finalidade (contains) e culturas recomendadas
    // (match exato de tag, já que é uma lista de strings curtas, não texto livre).
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            { brand: { contains: filters.search, mode: "insensitive" as const } },
            { purpose: { contains: filters.search, mode: "insensitive" as const } },
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
              type: "MANUAL_BLOCK" as const,
              startDate: { lt: filters.availableTo },
              endDate: { gt: filters.availableFrom },
            },
          },
          bookings: {
            none: {
              ...activeBookingStatusFilter(),
              startDate: { lt: filters.availableTo },
              endDate: { gt: filters.availableFrom },
            },
          },
        }
      : {}),
  };
}

// Busca paginada em duas fases: o catálogo pode ter centenas de máquinas ativas, e a ordenação
// final depende de distância (calculada em memória, sem API externa) e destaque Premium (não dá
// pra ordenar isso direto no banco sem denormalizar). Fase 1 busca só os campos usados nesse
// cálculo para descobrir a ordem e a página certa; fase 2 busca a galeria/categoria/propriedade
// completas só para os IDs que de fato vão aparecer nesta página — evita puxar imagens de todas as
// máquinas do catálogo pra descartar a maioria logo em seguida.
export async function listActiveMachines(
  filters: CatalogFilters = {},
  pagination: CatalogPagination = {},
) {
  const page = Math.max(1, pagination.page ?? 1);
  const pageSize = pagination.pageSize ?? CATALOG_PAGE_SIZE;
  const where = buildActiveMachinesWhere(filters);

  const candidates = await prisma.machine.findMany({
    where,
    select: {
      id: true,
      ownerId: true,
      property: { select: { latitude: true, longitude: true } },
      owner: { select: { subscription: { select: { currentPeriodEnd: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const origin =
    filters.originCity && filters.originState
      ? mockGeocodingProvider.geocode({ city: filters.originCity, state: filters.originState })
      : null;

  const withDistance = withDistanceFromOrigin(candidates, origin);

  const filtered =
    filters.maxDistanceKm !== undefined
      ? withDistance.filter((machine) => machine.distanceKm !== null && machine.distanceKm <= filters.maxDistanceKm!)
      : withDistance;

  if (origin) {
    filtered.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  // Destaque de parceiros Premium (Context.md §8.21): reordena colocando quem tem assinatura
  // ativa primeiro, sem descartar a ordenação por distância/data já aplicada acima (sort estável).
  const ordered = sortByPremiumFirst(filtered, (machine) => isPremiumActive(machine.owner.subscription));

  const total = ordered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Página pedida além do fim do resultado (ex.: um filtro aplicado depois reduziu o total) —
  // volta pra última página existente em vez de devolver uma lista vazia sem uma real página 1.
  const clampedPage = Math.min(page, totalPages);
  const pageSlice = ordered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  if (pageSlice.length === 0) {
    return { machines: [], page: clampedPage, pageSize, total, totalPages };
  }

  const orderedIds = pageSlice.map((machine) => machine.id);
  const distanceById = new Map(pageSlice.map((machine) => [machine.id, machine.distanceKm]));

  const fullMachines = await prisma.machine.findMany({
    where: { id: { in: orderedIds } },
    include: {
      category: true,
      property: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      owner: { select: { subscription: { select: { currentPeriodEnd: true } } } },
    },
  });
  // findMany com `id: { in }` não preserva a ordem da lista — reaplica a ordem já calculada acima.
  const fullById = new Map(fullMachines.map((machine) => [machine.id, machine]));
  const orderedFull = orderedIds.map((id) => fullById.get(id)!);

  // Nota média por máquina (Context.md §8.5: resultados devem exibir nota média) — uma única
  // consulta para os itens desta página em vez de uma por máquina.
  const ratings = await getAverageRatingsByMachineIds(
    orderedFull.map((machine) => ({ id: machine.id, ownerId: machine.ownerId })),
  );
  const machines = orderedFull.map((machine) => ({
    ...machine,
    distanceKm: distanceById.get(machine.id) ?? null,
    averageRating: ratings.get(machine.id)?.averageRating ?? null,
    reviewCount: ratings.get(machine.id)?.count ?? 0,
    ownerHasPremium: isPremiumActive(machine.owner.subscription),
  }));

  return { machines, page: clampedPage, pageSize, total, totalPages };
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

// Carrega máquinas já ativas por uma lista de ids, na mesma ordem recebida — base compartilhada
// por getMachinesByIds (cookie de "vistos recentemente") e listTopMachines ("mais procurados"),
// reaproveitando exatamente o include/rating/premium já usado em listActiveMachinesByOwner (sem
// distância, já que nenhuma das duas seções tem uma origem informada pelo usuário).
async function hydrateMachinesByIds(orderedIds: string[]) {
  if (orderedIds.length === 0) return [];

  const machines = await prisma.machine.findMany({
    where: { id: { in: orderedIds } },
    include: {
      category: true,
      property: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      owner: { select: { subscription: { select: { currentPeriodEnd: true } } } },
    },
  });
  const byId = new Map(machines.map((machine) => [machine.id, machine]));

  const ratings = await getAverageRatingsByMachineIds(
    machines.map((machine) => ({ id: machine.id, ownerId: machine.ownerId })),
  );

  return orderedIds
    .map((id) => byId.get(id))
    .filter((machine): machine is NonNullable<typeof machine> => machine !== undefined)
    .map((machine) => ({
      ...machine,
      distanceKm: null,
      averageRating: ratings.get(machine.id)?.averageRating ?? null,
      reviewCount: ratings.get(machine.id)?.count ?? 0,
      ownerHasPremium: isPremiumActive(machine.owner.subscription),
    }));
}

// "Vistos recentemente" da home — ids vêm do cookie gravado por RecordRecentlyViewed (client) na
// página de detalhe. Filtra pra só as que continuam publicamente visíveis (uma máquina vista antes
// pode ter sido pausada/removida desde então) antes de hidratar, preservando a ordem do cookie
// (mais recente primeiro).
export async function getMachinesByIds(ids: string[]) {
  if (ids.length === 0) return [];

  const activeMatches = await prisma.machine.findMany({
    where: { id: { in: ids }, status: "ACTIVE", deletedAt: null },
    select: { id: true },
  });
  const activeIdSet = new Set(activeMatches.map((machine) => machine.id));
  const orderedActiveIds = ids.filter((id) => activeIdSet.has(id));

  return hydrateMachinesByIds(orderedActiveIds);
}

// "Mais procurados" (máquinas) para a home — mesmo princípio de listTopCategories: sem uma
// métrica de busca dedicada, aproxima demanda pelo número de aluguéis já feitos; como desempate
// entre máquinas sem histórico de aluguel, usa o anúncio mais recente (mesma ordenação padrão de
// listActiveMachines).
export async function listTopMachines(limit: number) {
  const [machines, bookings] = await Promise.all([
    prisma.machine.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { id: true, createdAt: true },
    }),
    prisma.booking.findMany({ select: { machineId: true } }),
  ]);

  const bookingCountByMachine = new Map<string, number>();
  for (const booking of bookings) {
    bookingCountByMachine.set(booking.machineId, (bookingCountByMachine.get(booking.machineId) ?? 0) + 1);
  }

  const orderedIds = [...machines]
    .sort((a, b) => {
      const scoreDiff = (bookingCountByMachine.get(b.id) ?? 0) - (bookingCountByMachine.get(a.id) ?? 0);
      return scoreDiff !== 0 ? scoreDiff : b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, limit)
    .map((machine) => machine.id);

  return hydrateMachinesByIds(orderedIds);
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
