import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/features/authentication/lib/password";
import { loginSchema } from "@/features/authentication/schemas/login.schema";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || user.deletedAt || user.status !== "ACTIVE") return null;

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      const id = token.id;
      const role = token.role;
      if (typeof id === "string") session.user.id = id;
      if (typeof role === "string") session.user.role = role;
      return session;
    },
  },
});
