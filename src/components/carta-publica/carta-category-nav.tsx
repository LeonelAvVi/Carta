"use client";

import { useEffect, useState } from "react";
import type { CategoryWithProducts } from "@/lib/types";
import { cn } from "@/lib/utils";

type CartaCategoryNavProps = {
  categories: CategoryWithProducts[];
};

export function CartaCategoryNav({ categories }: CartaCategoryNavProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");

  useEffect(() => {
    if (!categories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id.startsWith("cat-")) {
          setActiveId(visible.target.id.replace("cat-", ""));
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    for (const category of categories) {
      const element = document.getElementById(`cat-${category.id}`);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [categories]);

  if (categories.length <= 1) return null;

  return (
    <nav
      aria-label="Ir a categoría"
      className="sticky top-0 z-20 border-b border-[color:var(--category-container-border)] bg-[color:var(--body-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--body-bg)]/80"
    >
      <div className="mx-auto max-w-lg px-4 py-3">
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const isActive = activeId === category.id;

            return (
              <li key={category.id} className="shrink-0">
                <a
                  href={`#cat-${category.id}`}
                  onClick={() => setActiveId(category.id)}
                  className={cn(
                    "inline-flex h-9 min-w-[44px] items-center px-4 text-sm font-medium transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tab-active-bg)] focus-visible:ring-offset-2",
                    "active:scale-[0.98] motion-safe:duration-150"
                  )}
                  style={{
                    borderRadius: "var(--tab-radius)",
                    backgroundColor: isActive ? "var(--tab-active-bg)" : "var(--tab-bg)",
                    color: isActive ? "var(--tab-active-text)" : "var(--tab-text)",
                    border: `1.5px solid ${isActive ? "var(--tab-active-border)" : "var(--tab-border)"}`,
                  }}
                  aria-current={isActive ? "true" : undefined}
                >
                  {category.name}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
