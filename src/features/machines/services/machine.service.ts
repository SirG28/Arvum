import type { Machine, MachineStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOwnedProperty } from "@/features/properties/services/property.service";
import { generateMachineSlug } from "../lib/slug";
import { canTransitionMachineStatus } from "../lib/machine-status";
import { toMachinePersistedData, type MachineFormOutput } from "../schemas/machine.schema";

// Reservas nestes status ainda impedem a remoção definitiva da máquina (§9.2).
// CANCELLED e COMPLETED são estados finais e não bloqueiam.
const ACTIVE_BOOKING_STATUSES = [
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
}

export async function listActiveMachines(filters: CatalogFilters = {}) {
  return prisma.machine.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
      ...(filters.search ? { title: { contains: filters.search, mode: "insensitive" } } : {}),
    },
    include: {
      category: true,
      property: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicMachineBySlug(slug: string) {
  const machine = await prisma.machine.findUnique({
    where: { slug },
    include: {
      category: true,
      property: true,
      owner: { select: { id: true, name: true } },
      images: { orderBy: { position: "asc" } },
      availability: { orderBy: { startDate: "asc" } },
    },
  });
  if (!machine || machine.status !== "ACTIVE" || machine.deletedAt) return null;
  return machine;
}
