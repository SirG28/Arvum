interface ChevronDownIconProps {
  className?: string;
}

// Mesmo contrato de todos os ícones do app — ver PlusIcon.tsx. Usado em qualquer gatilho de
// dropdown (Select nativo, MachineCategoryPicker, ...) para que a seta seja sempre a mesma forma,
// espessura e posição em toda a plataforma, em vez de cada campo desenhar a sua.
export function ChevronDownIcon({ className }: ChevronDownIconProps) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
