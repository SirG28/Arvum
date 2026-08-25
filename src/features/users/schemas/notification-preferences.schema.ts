import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  notifyByEmail: z.boolean(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
