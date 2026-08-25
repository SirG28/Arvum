interface PlusIconProps {
  className?: string;
}

// Ícone reutilizável para ações de "adicionar algo novo" (Nova propriedade, Nova máquina,
// Adicionar imagem) — mesmo estilo de traço dos demais ícones inline do app (viewBox 24x24,
// strokeWidth 1.6).
export function PlusIcon({ className }: PlusIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      aria-hidden="true"
      className={className ?? "h-4 w-4"}
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}
