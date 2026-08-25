// Traçado do ícone "user" do Feather — ver PlusIcon.tsx para o contrato completo. Exportado à
// parte para o Avatar.tsx (placeholder sem foto) e o ProfileMenu.tsx (item "Meu perfil" e botão-
// gatilho do menu) usarem o mesmo desenho — nunca duas "pessoas" diferentes no mesmo app.
export const USER_ICON_PATHS = (
  <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);

interface UserIconProps {
  className?: string;
}

export function UserIcon({ className }: UserIconProps) {
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
      {USER_ICON_PATHS}
    </svg>
  );
}
