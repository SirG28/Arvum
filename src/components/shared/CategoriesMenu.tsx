"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useMountTransition } from "@/hooks/useMountTransition";
import { CATEGORY_GROUPS } from "@/features/categories/lib/categoryGroups";
import { CategoryIcon } from "@/features/home/components/CategoryIcon";

interface CategoriesMenuCategory {
  slug: string;
  name: string;
}

// Item "Categorias" da linha superior do header (padrão "Grupos de carro" da Localiza) — dropdown
// com os grupos funcionais (categoryGroups.ts), mesma coreografia fade+scale do ProfileMenu.tsx.
export function CategoriesMenu({ categories }: { categories: CategoriesMenuCategory[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { rendered, visible, onTransitionEnd } = useMountTransition(open);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const groups = CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    categories: group.slugs.map((slug) => bySlug.get(slug)).filter((c): c is CategoriesMenuCategory => !!c),
  })).filter((group) => group.categories.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
          open ? "text-primary-700" : "text-neutral-700 hover:text-primary-700",
        )}
      >
        Categorias
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={1.8}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("h-3.5 w-3.5 transition-transform duration-fast", open && "rotate-180")}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {rendered && (
        <div
          role="menu"
          aria-label="Categorias de máquinas"
          onTransitionEnd={onTransitionEnd}
          className={cn(
            "absolute top-full left-0 z-50 mt-2 grid w-[36rem] origin-top-left grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-[var(--shadow-elevation-2)] transition-[opacity,scale] duration-base ease-out",
            visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-neutral-500">{group.label}</p>
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {group.categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={{ pathname: "/catalogo", query: { categoria: category.slug } }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                    >
                      <span className="text-primary-600">
                        <CategoryIcon slug={category.slug} />
                      </span>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Link
            href="/catalogo"
            onClick={() => setOpen(false)}
            className="col-span-2 mt-1 rounded-md border-t border-neutral-100 pt-3 text-sm font-medium text-primary-700 hover:underline"
          >
            Ver catálogo completo
          </Link>
        </div>
      )}
    </div>
  );
}
