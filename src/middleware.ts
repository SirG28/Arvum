import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtected =
    req.nextUrl.pathname.startsWith("/propriedades") ||
    req.nextUrl.pathname.startsWith("/maquinas") ||
    // Só o próprio perfil (edição via ?edit=1, sem segmento de rota) exige login — /perfil/[id] é
    // o perfil público de outro usuário, visível sem estar logado, como o catálogo.
    req.nextUrl.pathname === "/perfil" ||
    req.nextUrl.pathname.startsWith("/favoritos") ||
    req.nextUrl.pathname.startsWith("/alugueis") ||
    req.nextUrl.pathname.startsWith("/configuracoes") ||
    // Só barra anônimo aqui — o papel (ADMIN) só é conferido de verdade na própria página
    // (getCurrentUser, runtime Node), porque a sessão do middleware (Edge, auth.config.ts sem os
    // callbacks jwt/session) não carrega o campo "role".
    req.nextUrl.pathname.startsWith("/admin");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/propriedades/:path*",
    "/maquinas/:path*",
    "/perfil/:path*",
    "/favoritos/:path*",
    "/alugueis/:path*",
    "/configuracoes/:path*",
    "/admin/:path*",
  ],
};
