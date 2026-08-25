interface HeartIconProps {
  filled: boolean;
  className?: string;
}

// Traçado do ícone "heart" do Feather (mesma família da engrenagem de Configurações) — exportado
// à parte para o item "Favoritos" do menu de perfil (ProfileMenu.tsx) usar o mesmo desenho, nunca
// dois corações diferentes no mesmo app.
export const HEART_ICON_PATH =
  "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z";

// Mesmo contrato de todos os ícones do app — ver PlusIcon.tsx — com uma exceção documentada:
// preenche com a cor atual quando favoritado, em vez de ficar só no traço, para que o estado
// "favoritado" não dependa só de cor (contorno x preenchido é uma diferença de forma, não só de
// tom) — Context.md §13.
export function HeartIcon({ filled, className }: HeartIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      strokeWidth={1.6}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
    >
      <path d={HEART_ICON_PATH} />
    </svg>
  );
}
