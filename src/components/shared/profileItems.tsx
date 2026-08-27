import { HEART_ICON_PATH } from "@/components/ui/HeartIcon";
import { USER_ICON_PATHS } from "@/components/ui/UserIcon";

// Itens do usuário logado — reaproveitados pelo dropdown desktop (ProfileMenu), pela seção
// "conta" do MobileNavDrawer e pelos cards de "Acesso rápido" da home (app/page.tsx), para as
// três superfícies não desalinharem.
//
// Módulo à parte, sem "use client": um módulo "use client" só expõe referências de componente
// através da fronteira RSC, não dados simples como este array — por isso um Server Component
// (app/page.tsx) não conseguiria importar PROFILE_ITEMS diretamente de ProfileMenu.tsx.
//
// "Solicitações recebidas" fica fora desta lista de propósito: por ser urgente (aprovar/recusar
// tem prazo real), ganhou atalho fixo no cabeçalho (OwnerRequestsIndicator.tsx), no mesmo nível de
// "Minhas reservas" (ReservationsIndicator.tsx) — nenhuma das duas jamais esteve aqui dentro,
// então não é uma remoção nova, é manter a mesma regra: o que é urgente vive no cabeçalho, o resto
// vive neste menu.
export const PROFILE_ITEMS = [
  {
    href: "/perfil",
    label: "Meu perfil",
    icon: USER_ICON_PATHS,
  },
  {
    href: "/propriedades",
    label: "Minhas propriedades",
    // Traçado do ícone "home" do Feather.
    icon: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <path d="M9 22v-10h6v10" />
      </>
    ),
  },
  {
    href: "/maquinas",
    label: "Minhas máquinas",
    // Sem equivalente no Feather (não tem ícone de maquinário agrícola) — redesenhado maior,
    // ocupando quase todo o viewBox como os demais, em vez do desenho original (confinado a uma
    // faixa estreita no meio do quadro).
    icon: (
      <>
        <rect x="2" y="6" width="14" height="10" rx="1.4" />
        <path d="M16 10h3.2L22 13.5v3h-6" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
  },
  {
    href: "/favoritos",
    label: "Favoritos",
    // Mesmo traçado de HeartIcon.tsx (usado no coração de favoritar no catálogo) — nunca dois
    // desenhos de coração diferentes no mesmo app.
    icon: <path d={HEART_ICON_PATH} />,
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    // Engrenagem real (dentes trapezoidais), não um "sol"/asterisco de linhas finas radiando do
    // centro — o desenho anterior lia mal como ícone de configurações em 16px.
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    ),
  },
] as const;
