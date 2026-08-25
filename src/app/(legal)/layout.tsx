import type { ReactNode } from "react";
import { AppHeader } from "@/components/shared/AppHeader";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Footer } from "@/components/shared/Footer";
import { getCurrentUser } from "@/lib/session";

// Mesmo padrão de src/app/catalogo/layout.tsx: páginas legais precisam ficar acessíveis tanto
// para quem ainda não tem conta (durante o cadastro) quanto para quem já está logado (rodapé,
// Configurações), então o cabeçalho se adapta em vez de fixar um dos dois.
export default async function LegalLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {user ? <AppHeader /> : <PublicHeader />}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">{children}</main>
      <Footer />
    </div>
  );
}
