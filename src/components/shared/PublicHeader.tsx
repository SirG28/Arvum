import { listActiveCategories } from "@/features/categories/services/category.service";
import { PublicHeaderClient } from "./PublicHeaderClient";

// Server Component só pra buscar as categorias — o layout em si (2 linhas, encolhe ao rolar) vive
// em PublicHeaderClient.tsx ("use client", mesmo motivo documentado em AppHeaderClient.tsx).
export async function PublicHeader() {
  const categories = await listActiveCategories();
  return <PublicHeaderClient categories={categories} />;
}
