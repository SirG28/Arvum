interface PencilIconProps {
  className?: string;
}

// Mesmo contrato de todos os ícones do app — ver PlusIcon.tsx.
export function PencilIcon({ className }: PencilIconProps) {
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
      <path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19 4 20l1-4Z" />
    </svg>
  );
}
