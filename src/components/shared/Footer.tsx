import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo size={30} />
        <p className="text-xs text-neutral-500">
          © {new Date().getFullYear()} Arvum — máquinas agrícolas ociosas, transformadas em
          produtividade.
        </p>
        <nav aria-label="Links legais" className="flex gap-4 text-xs text-neutral-500">
          <Link href="/termos-de-uso" className="hover:text-neutral-700 hover:underline">
            Termos de uso
          </Link>
          <Link href="/politica-de-privacidade" className="hover:text-neutral-700 hover:underline">
            Política de privacidade
          </Link>
        </nav>
      </div>
    </footer>
  );
}
