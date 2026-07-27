import { prisma } from "@/lib/prisma";
import { getOwnedMachine } from "./machine.service";
import type { MachineAvailabilityInput } from "../schemas/machine-availability.schema";

export async function listBlocks(ownerId: string, machineId: string) {
  const machine = await getOwnedMachine(ownerId, machineId);
  if (!machine) return null;
  return prisma.machineAvailability.findMany({
    where: { machineId },
    orderBy: { startDate: "asc" },
  });
}

export type CreateBlockResult = Awaited<ReturnType<typeof prisma.machineAvailability.create>> | "OVERLAPS_EXISTING_BLOCK" | null;

export async function createBlock(
  ownerId: string,
  machineId: string,
  input: MachineAvailabilityInput,
): Promise<CreateBlockResult> {
  const machine = await getOwnedMachine(ownerId, machineId);
  if (!machine) return null;

  const overlapping = await prisma.machineAvailability.findFirst({
    where: {
      machineId,
      startDate: { lt: input.endDate },
      endDate: { gt: input.startDate },
    },
  });
  if (overlapping) return "OVERLAPS_EXISTING_BLOCK";

  return prisma.machineAvailability.create({
    data: {
      machineId,
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason,
      type: "MANUAL_BLOCK",
    },
  });
}

export type RemoveBlockResult = "REMOVED" | null;

export async function removeBlock(
  ownerId: string,
  machineId: string,
  blockId: string,
): Promise<RemoveBlockResult> {
  const machine = await getOwnedMachine(ownerId, machineId);
  if (!machine) return null;

  const block = await prisma.machineAvailability.findUnique({ where: { id: blockId } });
  if (!block || block.machineId !== machineId) return null;

  await prisma.machineAvailability.delete({ where: { id: blockId } });
  return "REMOVED";
}
