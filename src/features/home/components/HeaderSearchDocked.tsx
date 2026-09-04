import { HeaderSearchFields, type HeaderSearchFieldsCategory } from "./HeaderSearchFields";

// Os campos de busca (Máquina · Onde · Quando) — só o form em si; onde ele fica posicionado (2ª
// linha alinhada com a coluna central do header, ou 1ª linha no lugar de Categorias/Dúvidas depois
// de rolar) é decidido pelo grid do AppHeaderClient/PublicHeaderClient, não aqui. Um único
// componente pros dois casos: como as duas posições ocupam a mesma coluna da mesma grid (ver
// comentário em AppHeaderClient.tsx), nunca há duas instâncias montadas ao mesmo tempo.
export function HeaderSearchDocked({ categories }: { categories: HeaderSearchFieldsCategory[] }) {
  return (
    <form action="/catalogo" method="get">
      <HeaderSearchFields categories={categories} />
    </form>
  );
}
