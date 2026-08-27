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
//
// "Minhas máquinas" também fica fora desta lista de propósito (diferente de "Solicitações
// recebidas", isso É uma remoção — havia um item aqui antes): agora centralizada dentro de
// "Painel do proprietário" (/painel-do-proprietario), que reúne o que é exclusivo de quem anuncia
// máquinas (atalho para /maquinas, solicitações recebidas, Plano Premium) num único lugar, em vez
// de espalhar pelo menu genérico que mistura papéis de locatário e proprietário.
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
    href: "/painel-do-proprietario",
    label: "Painel do proprietário",
    // Mesmo traçado do ícone usado em OwnerRequestsIndicator.tsx (documento com check) — a
    // Arvum não tem um ícone próprio de "painel", e reaproveitar um traçado já familiar de
    // "solicitações/gestão" evita introduzir um terceiro desenho para o mesmo tipo de conceito.
    icon: (
      <>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
        <path d="m8.5 13 2.3 2.3L15.5 11" />
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
