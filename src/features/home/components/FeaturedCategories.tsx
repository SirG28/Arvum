import Link from "next/link";
import type { MachineCategory } from "@prisma/client";
import { CategoryIcon } from "./CategoryIcon";

export function FeaturedCategories({ categories }: { categories: MachineCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2
        className="text-xl font-semibold text-neutral-900"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Categorias mais procuradas
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={{ pathname: "/catalogo", query: { categoria: category.slug } }}
            className="rounded-lg border border-neutral-200 bg-white p-5 shadow-[var(--shadow-elevation-1)] transition-colors hover:border-primary-200 hover:bg-primary-50"
          >
            <div className="mb-3 inline-flex rounded-md bg-primary-50 p-2 text-primary-600">
              <CategoryIcon slug={category.slug} />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">{category.name}</h3>
            {category.description && (
              <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
