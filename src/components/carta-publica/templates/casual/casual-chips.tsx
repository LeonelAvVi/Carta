"use client";

import { useState } from "react";
import type { CategoryWithProducts } from "@/lib/types";
import { cn } from "@/lib/utils";

export const CASUAL_ALL_CATEGORY = "__all__";

type CasualChipsProps = {
  categories: CategoryWithProducts[];
  activeId: string;
  onChange: (categoryId: string) => void;
};

export function CasualChips({ categories, activeId, onChange }: CasualChipsProps) {
  if (categories.length <= 1) return null;

  return (
    <nav
      aria-label="Filtrar por categoría"
      className="border-b px-4 py-2.5"
      style={{
        backgroundColor: "var(--body-bg)",
        borderColor: "var(--category-container-border)",
      }}
    >
      <ul className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <button
            type="button"
            onClick={() => onChange(CASUAL_ALL_CATEGORY)}
            className={cn(
              "inline-flex h-8 items-center px-3.5 text-[10px] font-semibold transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tab-active-bg)] focus-visible:ring-offset-2"
            )}
            style={{
              borderRadius: "var(--tab-radius)",
              backgroundColor:
                activeId === CASUAL_ALL_CATEGORY ? "var(--tab-active-bg)" : "var(--tab-bg)",
              color:
                activeId === CASUAL_ALL_CATEGORY ? "var(--tab-active-text)" : "var(--tab-text)",
              border: `1.5px solid ${
                activeId === CASUAL_ALL_CATEGORY
                  ? "var(--tab-active-border)"
                  : "var(--tab-border)"
              }`,
            }}
            aria-pressed={activeId === CASUAL_ALL_CATEGORY}
          >
            Todo
          </button>
        </li>
        {categories.map((category) => {
          const isActive = activeId === category.id;
          return (
            <li key={category.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(category.id)}
                className={cn(
                  "inline-flex h-8 items-center whitespace-nowrap px-3.5 text-[10px] font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tab-active-bg)] focus-visible:ring-offset-2"
                )}
                style={{
                  borderRadius: "var(--tab-radius)",
                  backgroundColor: isActive ? "var(--tab-active-bg)" : "var(--tab-bg)",
                  color: isActive ? "var(--tab-active-text)" : "var(--tab-text)",
                  border: `1.5px solid ${
                    isActive ? "var(--tab-active-border)" : "var(--tab-border)"
                  }`,
                }}
                aria-pressed={isActive}
              >
                {category.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function useCasualActiveCategory(categories: CategoryWithProducts[]) {
  const [activeId, setActiveId] = useState(
    categories.length > 1 ? CASUAL_ALL_CATEGORY : categories[0]?.id ?? CASUAL_ALL_CATEGORY
  );

  return { activeId, setActiveId };
}
