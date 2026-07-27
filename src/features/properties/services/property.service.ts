import { prisma } from "@/lib/prisma";
import type { PropertyInput } from "../schemas/property.schema";

export async function listPropertiesByOwner(ownerId: string) {
  return prisma.property.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProperty(ownerId: string, input: PropertyInput) {
  return prisma.property.create({ data: { ...input, ownerId } });
}

export async function getOwnedProperty(ownerId: string, propertyId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property || property.ownerId !== ownerId) return null;
  return property;
}

export async function updateProperty(ownerId: string, propertyId: string, input: PropertyInput) {
  const owned = await getOwnedProperty(ownerId, propertyId);
  if (!owned) return null;
  return prisma.property.update({ where: { id: propertyId }, data: input });
}

export type DeletePropertyResult = "DELETED" | "HAS_DEPENDENCIES" | null;

export async function deleteProperty(
  ownerId: string,
  propertyId: string,
): Promise<DeletePropertyResult> {
  const owned = await getOwnedProperty(ownerId, propertyId);
  if (!owned) return null;

  const linkedMachines = await prisma.machine.count({ where: { propertyId } });
  if (linkedMachines > 0) return "HAS_DEPENDENCIES";

  await prisma.property.delete({ where: { id: propertyId } });
  return "DELETED";
}
