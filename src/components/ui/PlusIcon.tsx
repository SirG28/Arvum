interface PlusIconProps {
  className?: string;
}

// Contrato compartilhado por todos os ícones inline do app: viewBox 24x24, sem preenchimento,
// traço de 1.6 com pontas e junções arredondadas (definidas uma vez no <svg>, herdadas pelos
// <path> filhos — nunca repetidas em cada um), sempre aria-hidden (o rótulo textual ao lado é
// quem descreve a ação para leitor de tela). Tamanho padrão h-4 w-4 (ícone em linha/lista);
// contextos maiores sobrescrevem via `className` (h-5 w-5 em botões-gatilho do cabeçalho, h-6 w-6
// em cards de destaque) — nunca um valor arbitrário novo.
export function PlusIcon({ className }: PlusIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-4 w-4"}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
