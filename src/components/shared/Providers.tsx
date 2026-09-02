"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ToastProvider } from "./ToastProvider";

interface ProvidersProps {
  children: ReactNode;
  // Sessão já validada no servidor (RootLayout, via auth()) — evita que o SessionProvider precise
  // buscar /api/auth/session no cliente para descobrir de novo quem está logado, o que fazia os
  // indicadores do header (RentalsIndicator/ProfileMenu) renderizarem null até essa chamada
  // extra voltar.
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
