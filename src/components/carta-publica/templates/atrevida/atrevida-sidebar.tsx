"use client";

import type { CategoryWithProducts } from "@/lib/types";
import { cn } from "@/lib/utils";

type AtrevidaSidebarProps = {
  categories: CategoryWithProducts[];
  activeId: string;
  onChange: (categoryId: string) => void;
};

export function AtrevidaSidebar({
  categories,
  activeId,
  onChange,
}: AtrevidaSidebarProps) {
  return (
    <nav
      aria-label="Categorías"
      className="w-[52px] shrink-0 border-r"
      style={{
        backgroundColor: "var(--tab-bg)",
        borderColor: "var(--item-border)",
      }}
    >
      <ul>
        {categories.map((category, index) => {
          const isActive = activeId === category.id;
          const num = String(index + 1).padStart(2, "0");

          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onChange(category.id)}
                className={cn(
                  "w-full px-1 py-3 text-center transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--tab-active-bg)]"
                )}
                style={{
                  borderBottom: "1px solid var(--item-border)",
                  borderLeft: isActive ? "3px solid var(--tab-active-bg)" : "3px solid transparent",
                  backgroundColor: isActive ? "color-mix(in srgb, var(--tab-active-bg) 12%, transparent)" : "transparent",
                }}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className="block text-[9px] font-bold leading-none"
                  style={{ color: "var(--tab-active-bg)" }}
                >
                  {num}
                </span>
                <span
                  className="mt-1 block break-words text-[8px] leading-tight"
                  style={{
                    color: isActive ? "var(--header-name-color)" : "var(--item-desc-color)",
                  }}
                >
                  {category.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
