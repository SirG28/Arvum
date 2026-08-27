// Navegação geral do site — itens específicos do usuário logado (propriedades, máquinas,
// favoritos, configurações) vivem em profileItems.tsx (ver ProfileMenu.tsx), não aqui.
//
// Módulo à parte, sem "use client": ver o mesmo comentário em profileItems.tsx — permite que um
// Server Component (app/page.tsx) importe NAV_ITEMS diretamente, sem passar pela fronteira RSC de
// AppNav.tsx.
//
// O ícone não aparece na barra horizontal do desktop (AppNav.tsx) — só existe para o
// MobileNavDrawer, onde este item entra na mesma lista dos PROFILE_ITEMS e precisa do mesmo
// padrão visual (ícone + rótulo) para não destoar dos demais dentro do menu aberto.
export const NAV_ITEMS = [
  {
    href: "/catalogo",
    label: "Catálogo",
    // Traçado do ícone "search" do Feather (mesma família da engrenagem de Configurações).
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    ),
  },
] as const;
