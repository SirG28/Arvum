import { z } from "zod";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export const machineAvailabilitySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "A data final deve ser posterior à inicial.",
    path: ["endDate"],
  })
  .refine((data) => data.startDate >= startOfToday(), {
    message: "Não é possível bloquear datas passadas.",
    path: ["startDate"],
  });

export type MachineAvailabilityInput = z.infer<typeof machineAvailabilitySchema>;
