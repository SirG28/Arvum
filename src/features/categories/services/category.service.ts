import { prisma } from "@/lib/prisma";

export async function listActiveCategories() {
  return prisma.machineCategory.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}
