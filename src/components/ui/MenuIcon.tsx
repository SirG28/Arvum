interface MenuIconProps {
  open: boolean;
  className?: string;
}

// Mesmo contrato de todos os ícones do app — ver PlusIcon.tsx. Alterna entre hambúrguer e X
// conforme `open`, para o botão de abrir/fechar o MobileNavDrawer nunca precisar de dois ícones
// separados.
export function MenuIcon({ open, className }: MenuIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
    >
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}
