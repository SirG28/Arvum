interface TrashIconProps {
  className?: string;
}

// Ícone de remoção — mesmo estilo de traço dos demais ícones inline do app (viewBox 24x24,
// strokeWidth 1.6), ver PlusIcon.tsx.
export function TrashIcon({ className }: TrashIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      aria-hidden="true"
      className={className ?? "h-4 w-4"}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}
