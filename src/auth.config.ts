import type { NextAuthConfig } from "next-auth";

// Configuração edge-safe: sem providers que dependam de Prisma/bcryptjs, para que o
// middleware (que roda no Edge Runtime) não empacote dependências Node-only.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
} satisfies NextAuthConfig;
