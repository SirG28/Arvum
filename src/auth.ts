import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/features/authentication/lib/password";
import { loginSchema } from "@/features/authentication/schemas/login.schema";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
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
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        // Duas chaves independentes: por IP (freia um único atacante testando várias contas) e
        // por e-mail (freia várias origens tentando a senha de uma conta específica). Cada
        // chamada de authorize já conta como uma tentativa, sucesso ou falha — como não há
        // recuperação de senha nem 2FA ainda, um "estou testando minha senha de novo" legítimo é
        // raro o bastante pra não precisar distinguir tentativa falha de bem-sucedida aqui.
        // Bloqueado devolve null, a mesma resposta de credenciais inválidas — não é diferenciado
        // no cliente de propósito (Auth.js recomenda evitar pistas específicas em erro de login).
        const ip = getClientIp(request.headers);
        const ipCheck = consumeRateLimit(`login:ip:${ip}`, { windowMs: 10 * 60 * 1000, max: 15 });
        const emailCheck = consumeRateLimit(`login:email:${parsed.data.email}`, {
          windowMs: 10 * 60 * 1000,
          max: 6,
        });
        if (!ipCheck.allowed || !emailCheck.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || user.deletedAt || user.status !== "ACTIVE") return null;

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    // trigger "update" acontece quando o cliente chama useSession().update(...) — usado depois de
    // editar o perfil (ProfileForm) para o nome no cabeçalho/saudação refletir a mudança sem exigir
    // logout/login, já que a sessão JWT não é revalidada contra o banco a cada requisição.
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      if (trigger === "update" && typeof session?.name === "string") {
        token.name = session.name;
      }
      if (trigger === "update" && typeof session?.email === "string") {
        token.email = session.email;
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
