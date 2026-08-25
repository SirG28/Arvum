import Link from "next/link";
import { cn } from "@/lib/cn";

interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
}

// Link "voltar" padronizado para telas de detalhe (Context.md §12.2 — variação mínima de
// Breadcrumb). Ícone de seta em vez do glifo "←": renderiza igual em qualquer fonte/SO e some do
// texto para leitor de tela (aria-hidden), diferente de um caractere unicode dentro do próprio
// texto do link.
export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={1.6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <path d="M15 5 8 12l7 7" />
      </svg>
      {label}
    </Link>
  );
}
