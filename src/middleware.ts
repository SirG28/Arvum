import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtected =
    req.nextUrl.pathname.startsWith("/propriedades") ||
    req.nextUrl.pathname.startsWith("/maquinas") ||
    req.nextUrl.pathname.startsWith("/perfil") ||
    req.nextUrl.pathname.startsWith("/favoritos") ||
    req.nextUrl.pathname.startsWith("/reservas") ||
    req.nextUrl.pathname.startsWith("/configuracoes");

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
    "/reservas/:path*",
    "/configuracoes/:path*",
  ],
};
