import { z } from "zod";

export const machineImageSchema = z.object({
  url: z.string().trim().url("Informe uma URL de imagem válida."),
  altText: z.string().trim().optional(),
});

export type MachineImageInput = z.infer<typeof machineImageSchema>;
