import { prisma } from "@/lib/prisma";
import { mockGeocodingProvider } from "@/lib/geo/geocoding";
import type { PropertyInput } from "../schemas/property.schema";

// Nenhum formulário coleta latitude/longitude manualmente (Context.md §8.2 permite coordenadas
// simuladas) — preenche a partir da cidade/UF via adaptador de geocodificação simulado sempre que
// o proprietário não informar as coordenadas explicitamente.
function withGeocodedCoordinates(input: PropertyInput): PropertyInput {
  if (input.latitude !== undefined && input.longitude !== undefined) return input;

  const point = mockGeocodingProvider.geocode({ city: input.city, state: input.state });
  if (!point) return input;

  return {
    ...input,
    latitude: input.latitude ?? point.latitude,
    longitude: input.longitude ?? point.longitude,
  };
}

export async function listPropertiesByOwner(ownerId: string) {
  return prisma.property.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProperty(ownerId: string, input: PropertyInput) {
  return prisma.property.create({ data: { ...withGeocodedCoordinates(input), ownerId } });
}

export async function getOwnedProperty(ownerId: string, propertyId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property || property.ownerId !== ownerId) return null;
  return property;
}

export async function updateProperty(ownerId: string, propertyId: string, input: PropertyInput) {
  const owned = await getOwnedProperty(ownerId, propertyId);
  if (!owned) return null;
  return prisma.property.update({ where: { id: propertyId }, data: withGeocodedCoordinates(input) });
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
