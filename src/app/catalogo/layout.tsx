import type { ReactNode } from "react";
import { AppHeader } from "@/components/shared/AppHeader";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Footer } from "@/components/shared/Footer";
import { getCurrentUser } from "@/lib/session";

export default async function CatalogLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {user ? <AppHeader /> : <PublicHeader />}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
