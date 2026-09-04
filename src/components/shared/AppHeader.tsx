import { listActiveCategories } from "@/features/categories/services/category.service";
import { AppHeaderClient } from "./AppHeaderClient";

// Server Component só pra buscar as categorias — o layout em si (2 linhas, encolhe ao rolar) vive
// em AppHeaderClient.tsx ("use client", ver comentário lá sobre por quê).
export async function AppHeader() {
  const categories = await listActiveCategories();
  return <AppHeaderClient categories={categories} />;
}
