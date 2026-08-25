interface SignOutIconProps {
  className?: string;
}

// Traçado do ícone "log-out" do Feather (mesma família da engrenagem de Configurações) — mesmo
// contrato de todos os ícones do app, ver PlusIcon.tsx. Compartilhado entre ProfileMenu (desktop)
// e MobileNavDrawer (mobile) — mesmo ícone nas duas superfícies, não duas cópias divergentes.
export function SignOutIcon({ className }: SignOutIconProps) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
