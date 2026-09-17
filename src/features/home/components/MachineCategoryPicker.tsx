"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useMountTransition } from "@/hooks/useMountTransition";
import { CATEGORY_GROUPS } from "@/features/categories/lib/categoryGroups";
import { CategoryIcon } from "./CategoryIcon";

export interface MachineCategoryPickerCategory {
  slug: string;
  name: string;
}

interface MachineCategoryPickerProps {
  categories: MachineCategoryPickerCategory[];
  name: string;
  className?: string;
}

function buildOptionGroups(categories: MachineCategoryPickerCategory[]) {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const grouped = CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    categories: group.slugs.map((slug) => bySlug.get(slug)).filter((c): c is MachineCategoryPickerCategory => !!c),
  })).filter((group) => group.categories.length > 0);

  const groupedSlugs = new Set(CATEGORY_GROUPS.flatMap((group) => group.slugs));
  const ungrouped = categories.filter((category) => !groupedSlugs.has(category.slug));
  if (ungrouped.length > 0) grouped.push({ label: "Outras categorias", categories: ungrouped });

  return grouped;
}

// Substitui o <select> nativo que este campo tinha (rotulado "Máquina") por um dropdown com a
// grade de grupos + ícone que o antigo dropdown "Categorias" do header já usava (CategoriesMenu.tsx,
// removido — virou o link simples CatalogNavLink.tsx). Continua um campo de formulário de verdade:
// o valor escolhido vai num <input type="hidden"> com o mesmo `name` que o <select> tinha, então o
// submit em /catalogo (HeaderSearchDocked.tsx, method="get") não precisa mudar nada.
//
// Mesma coreografia fade+scale do CategoriesMenu original (useMountTransition + fechar no
// clique-fora/Escape), mas a lista de opções vira <button> em vez de <Link> — aqui o clique
// seleciona um valor de formulário, não navega.
export function MachineCategoryPicker({ categories, name, className }: MachineCategoryPickerProps) {
  const [selectedSlug, setSelectedSlug] = useState("");
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

  const groups = buildOptionGroups(categories);
  const selectedCategory = categories.find((category) => category.slug === selectedSlug);

  function selectCategory(slug: string) {
    setSelectedSlug(slug);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={selectedSlug} />
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none"
      >
        <span className={cn("truncate", selectedCategory ? "text-neutral-900" : "text-neutral-400")}>
          {selectedCategory?.name ?? "Tipo de máquina"}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={1.8}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-fast",
            open && "rotate-180",
          )}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {rendered && (
        <div
          role="menu"
          aria-label="Tipo de máquina"
          onTransitionEnd={onTransitionEnd}
          className={cn(
            "absolute top-full left-0 z-50 mt-2 grid w-[calc(100vw-2rem)] origin-top-left grid-cols-1 gap-x-6 gap-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-[var(--shadow-elevation-2)] transition-[opacity,scale] duration-base ease-out sm:w-[36rem] sm:grid-cols-2",
            visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-neutral-500">{group.label}</p>
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {group.categories.map((category) => (
                  <li key={category.slug}>
                    <button
                      type="button"
                      onClick={() => selectCategory(category.slug)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-primary-50 hover:text-primary-700",
                        category.slug === selectedSlug ? "bg-primary-50 text-primary-700" : "text-neutral-700",
                      )}
                    >
                      <span className="text-primary-600">
                        <CategoryIcon slug={category.slug} />
                      </span>
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {selectedSlug && (
            <button
              type="button"
              onClick={() => selectCategory("")}
              className="col-span-1 mt-1 rounded-md border-t border-neutral-100 pt-3 text-left text-sm font-medium text-neutral-500 hover:text-neutral-700 sm:col-span-2"
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  );
}
