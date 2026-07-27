import type { ReactNode } from "react";
import { AppHeader } from "@/components/shared/AppHeader";
import { Footer } from "@/components/shared/Footer";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
