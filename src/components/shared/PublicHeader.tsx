import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";

export function PublicHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Logo size={36} />
          </Link>
          <nav aria-label="Navegação principal">
            <Link
              href="/catalogo"
              className="text-sm font-medium text-neutral-700 hover:text-primary-700"
            >
              Catálogo
            </Link>
          </nav>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="secondary">Entrar</Button>
          </Link>
          <Link href="/cadastro">
            <Button>Criar conta</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
