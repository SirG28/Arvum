// Agrupamento funcional das categorias do seed (prisma/seed.ts) — usado pelo dropdown "Máquina" do
// header (HeaderSearchWidget) e para reorganizar FeaturedCategories por grupo em vez de lista solta.
// Mesmo papel do "Grupo de carros" da Localiza / "Todas as categorias" do Mercado Livre: um nível a
// mais entre "tudo" e as 12 categorias, para o usuário não escanear uma lista plana.
//
// Sem "use client": módulo de dados simples, importável tanto por Server Components (app/page.tsx)
// quanto pelo HeaderSearchWidget ("use client") — um módulo "use client" só expõe referências de
// componente através da fronteira RSC, não dados simples como este array.
export interface CategoryGroup {
  label: string;
  slugs: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { label: "Preparo de solo", slugs: ["arados", "grades"] },
  { label: "Plantio e semeadura", slugs: ["plantadeiras", "semeadoras"] },
  { label: "Colheita", slugs: ["colheitadeiras"] },
  { label: "Pulverização e adubação", slugs: ["pulverizadores", "distribuidores"] },
  { label: "Tração", slugs: ["tratores"] },
  { label: "Irrigação", slugs: ["equipamentos-de-irrigacao"] },
  { label: "Transporte e logística", slugs: ["transporte-agricola"] },
  { label: "Tecnologia agrícola", slugs: ["tecnologia-agricola"] },
  { label: "Implementos e outros", slugs: ["implementos", "outros"] },
];

// Categorias que não batem nenhum slug mapeado acima caem aqui — evita que uma categoria nova no
// banco (cadastrada fora deste arquivo) desapareça do dropdown/dos agrupamentos em vez de só ficar
// mal agrupada.
const GROUP_BY_SLUG = new Map(
  CATEGORY_GROUPS.flatMap((group) => group.slugs.map((slug) => [slug, group.label])),
);

export function groupLabelForSlug(slug: string): string {
  return GROUP_BY_SLUG.get(slug) ?? "Outras categorias";
}
