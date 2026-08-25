interface PencilIconProps {
  className?: string;
}

// Ícone de edição — mesmo estilo de traço dos demais ícones inline do app (viewBox 24x24,
// strokeWidth 1.6), ver PlusIcon.tsx.
export function PencilIcon({ className }: PencilIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      aria-hidden="true"
      className={className ?? "h-4 w-4"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19 4 20l1-4Z"
      />
    </svg>
  );
}
