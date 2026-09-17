import Link from "next/link";

// Item "Catálogo" da primeira linha do header — antes era o dropdown "Categorias"
// (CategoriesMenu.tsx, removido), mas o mesmo destino (grupos funcionais + "Ver catálogo
// completo") já vive dentro do próprio dropdown "Tipo de máquina" da busca
// (MachineCategoryPicker.tsx, ao lado). Manter os dois como dropdown seria repetir a mesma lista
// duas vezes na mesma barra — aqui vira só um link direto pro catálogo geral.
export function CatalogNavLink() {
  return (
    <Link
      href="/catalogo"
      className="rounded-md px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:text-primary-700"
    >
      Catálogo
    </Link>
  );
}
