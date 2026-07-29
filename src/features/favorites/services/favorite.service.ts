import { prisma } from "@/lib/prisma";

export async function listFavoriteMachineIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { machineId: true },
  });
  return new Set(favorites.map((favorite) => favorite.machineId));
}

export async function listFavoritesByUser(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      machine: {
        include: {
          category: true,
          property: true,
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type AddFavoriteResult =
  | Awaited<ReturnType<typeof prisma.favorite.create>>
  | "MACHINE_NOT_FOUND"
  | "ALREADY_FAVORITED";

export async function addFavorite(userId: string, machineId: string): Promise<AddFavoriteResult> {
  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!machine || machine.deletedAt) return "MACHINE_NOT_FOUND";

  const existing = await prisma.favorite.findUnique({
    where: { userId_machineId: { userId, machineId } },
  });
  if (existing) return "ALREADY_FAVORITED";

  return prisma.favorite.create({ data: { userId, machineId } });
}

export type RemoveFavoriteResult = "REMOVED" | "NOT_FOUND";

export async function removeFavorite(
  userId: string,
  machineId: string,
): Promise<RemoveFavoriteResult> {
  const existing = await prisma.favorite.findUnique({
    where: { userId_machineId: { userId, machineId } },
  });
  if (!existing) return "NOT_FOUND";

  await prisma.favorite.delete({ where: { id: existing.id } });
  return "REMOVED";
}
