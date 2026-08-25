import { cn } from "@/lib/cn";

interface MenuIconProps {
  open: boolean;
  className?: string;
}

// Três linhas sempre no DOM — a transição hambúrguer↔X anima transform/opacity de cada uma via
// CSS (MOTION.md, Etapa 3). Nunca troca o `d` de um path entre duas formas diferentes: o
// navegador não interpola isso de forma confiável, então a troca ficava abrupta mesmo com
// `transition-*` aplicado. Mesmo contrato dos demais ícones do app (viewBox 24x24, strokeWidth
// 1.6) — ver PlusIcon.tsx.
//
// `[transform-box:fill-box] origin-center` é obrigatório nas duas linhas que giram: o padrão do
// CSS para elementos SVG é `transform-box: view-box`, que resolve `transform-origin` em relação
// ao viewBox inteiro (e, nesta engine, na prática pivota no canto (0,0) dele) — não no centro de
// cada linha. Sem isso, `rotate-45`/`-rotate-45` giram em torno do ponto errado e as linhas nunca
// se encontram no meio, formando uma forma torta em vez de um X (bug real, encontrado em
// verificação visual — MOTION.md).
export function MenuIcon({ open, className }: MenuIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
    >
      <line
        x1="4"
        y1="7"
        x2="20"
        y2="7"
        className={cn(
          "origin-center transition-transform duration-fast ease-out [transform-box:fill-box]",
          open && "translate-y-[5px] rotate-45",
        )}
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        className={cn("transition-opacity duration-fast ease-out", open && "opacity-0")}
      />
      <line
        x1="4"
        y1="17"
        x2="20"
        y2="17"
        className={cn(
          "origin-center transition-transform duration-fast ease-out [transform-box:fill-box]",
          open && "-translate-y-[5px] -rotate-45",
        )}
      />
    </svg>
  );
}
