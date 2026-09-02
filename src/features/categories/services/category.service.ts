import { prisma } from "@/lib/prisma";

export async function listActiveCategories() {
  return prisma.machineCategory.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

// "Mais procuradas" para a home: sem uma métrica de busca dedicada, aproxima demanda por
// aluguéis feitos (peso maior) e, como desempate para categorias ainda sem histórico de aluguel,
// pelo número de máquinas ativas anunciadas (proxy de oferta/procura).
export async function listTopCategories(limit: number) {
  const [categories, machines, bookings] = await Promise.all([
    prisma.machineCategory.findMany({ where: { active: true } }),
    prisma.machine.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { categoryId: true },
    }),
    prisma.booking.findMany({ select: { machine: { select: { categoryId: true } } } }),
  ]);

  const machineCountByCategory = new Map<string, number>();
  for (const machine of machines) {
    machineCountByCategory.set(machine.categoryId, (machineCountByCategory.get(machine.categoryId) ?? 0) + 1);
  }

  const bookingCountByCategory = new Map<string, number>();
  for (const booking of bookings) {
    const categoryId = booking.machine.categoryId;
    bookingCountByCategory.set(categoryId, (bookingCountByCategory.get(categoryId) ?? 0) + 1);
  }

  const score = (categoryId: string) =>
    (bookingCountByCategory.get(categoryId) ?? 0) * 3 + (machineCountByCategory.get(categoryId) ?? 0);

  return [...categories].sort((a, b) => score(b.id) - score(a.id)).slice(0, limit);
}
