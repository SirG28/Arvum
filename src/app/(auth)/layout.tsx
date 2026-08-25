import type { ReactNode } from "react";
import { Logo } from "@/components/shared/Logo";
import { AuthBrandPanel } from "@/features/authentication/components/AuthBrandPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex md:w-[42%] lg:w-1/2">
        <AuthBrandPanel />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center bg-neutral-50 px-4 py-10 sm:py-12">
        <div className="mb-6 flex w-full max-w-sm flex-col items-start gap-1 text-left md:hidden">
          <Logo size={32} />
          <p className="text-sm text-neutral-500">
            Alugue e anuncie máquinas agrícolas com segurança.
          </p>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
