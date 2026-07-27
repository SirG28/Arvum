import { apiSuccess } from "@/lib/api-response";
import { listActiveCategories } from "@/features/categories/services/category.service";

export async function GET() {
  const categories = await listActiveCategories();
  return apiSuccess(categories);
}
