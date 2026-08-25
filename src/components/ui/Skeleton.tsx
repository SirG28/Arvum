import { cn } from "@/lib/cn";

// Placeholder cinza para conteúdo ainda carregando (Context.md §11.5/§12.2) — usado dentro dos
// `loading.tsx` de cada rota (Next.js App Router), nunca sozinho: o container que o envolve é
// quem carrega `role="status"`/texto para leitor de tela (ver ex.: src/app/catalogo/loading.tsx).
// `animate-pulse` é utilitário nativo do Tailwind, já respeita `prefers-reduced-motion` via a regra
// global em globals.css.
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-neutral-200", className)} />;
}
