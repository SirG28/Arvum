import { cn } from "@/lib/cn";

interface VerifiedPartnerBadgeProps {
  className?: string;
  // Card do catálogo: só o selo, sem legenda — grade já densa de informação por card (Arvum
  // Playbook §04). Página de detalhe e perfil continuam com a legenda (padrão), onde o selo
  // aparece uma única vez e tem espaço de sobra ao lado do nome do proprietário.
  iconOnly?: boolean;
}

// Selo de verificação (ícone + texto), não um chip colorido — a marca é a estrela de 8 pontas
// arredondadas com check preenchido (mesma silhueta do selo do Instagram/X), não um círculo liso.
// A estrela é dois quadrados arredondados sobrepostos, um girado 45°, mesma técnica usada nesses
// selos de verificação — o texto ao lado só reforça o que o ícone já comunica sozinho. Único
// desenho nas três superfícies onde aparece (card do catálogo, página de detalhe, perfil).
export function VerifiedPartnerBadge({ className, iconOnly = false }: VerifiedPartnerBadgeProps) {
  return (
    <span
      title={iconOnly ? "Parceiro verificado" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-xs font-medium whitespace-nowrap text-success-500",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
        <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" transform="rotate(45 12 12)" />
        <path
          d="M8 12.5l2.5 2.5L16 9"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {iconOnly ? <span className="sr-only">Parceiro verificado</span> : "Parceiro verificado"}
    </span>
  );
}
