import { prisma } from "@/lib/prisma";
import { getOwnedMachine } from "./machine.service";

interface AddImageInput {
  url: string;
  altText?: string;
}

export async function listImages(ownerId: string, machineId: string) {
  const machine = await getOwnedMachine(ownerId, machineId);
  if (!machine) return null;
  return prisma.machineImage.findMany({ where: { machineId }, orderBy: { position: "asc" } });
}

export async function addImage(ownerId: string, machineId: string, input: AddImageInput) {
  const machine = await getOwnedMachine(ownerId, machineId);
  if (!machine) return null;

  const last = await prisma.machineImage.findFirst({
    where: { machineId },
    orderBy: { position: "desc" },
  });

  return prisma.machineImage.create({
    data: {
      machineId,
      url: input.url,
      altText: input.altText,
      position: last ? last.position + 1 : 0,
    },
  });
}

export type RemoveImageResult = "REMOVED" | null;

export async function removeImage(
  ownerId: string,
  machineId: string,
  imageId: string,
): Promise<RemoveImageResult> {
  const machine = await getOwnedMachine(ownerId, machineId);
  if (!machine) return null;

  const image = await prisma.machineImage.findUnique({ where: { id: imageId } });
  if (!image || image.machineId !== machineId) return null;

  await prisma.machineImage.delete({ where: { id: imageId } });
  return "REMOVED";
}
