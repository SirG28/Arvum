import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório."),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET é obrigatório."),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
});
