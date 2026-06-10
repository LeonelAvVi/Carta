"use client";

import { useMemo } from "react";
import {
  CASUAL_ALL_CATEGORY,
  CasualChips,
  useCasualActiveCategory,
} from "@/components/carta-publica/templates/casual/casual-chips";
import { CasualCard } from "@/components/carta-publica/templates/casual/casual-card";
import { CasualFooter } from "@/components/carta-publica/templates/casual/casual-footer";
import { CasualHeader } from "@/components/carta-publica/templates/casual/casual-header";
import type { CartaTemplateProps } from "@/lib/carta/template-types";
import type { MenuItemRow } from "@/lib/types";

export function CasualCarta({ restaurant, theme, sections }: CartaTemplateProps) {
  const { allNavCategories } = sections;
  const { activeId, setActiveId } = useCasualActiveCategory(allNavCategories);

  const visibleItems = useMemo((): MenuItemRow[] => {
    if (allNavCategories.length === 0) return [];

    if (activeId === CASUAL_ALL_CATEGORY) {
      return allNavCategories.flatMap((category) => category.menu_items);
    }

    const category = allNavCategories.find((c) => c.id === activeId);
    return category?.menu_items ?? [];
  }, [activeId, allNavCategories]);

  return (
    <>
      <main>
        <CasualHeader restaurant={restaurant} theme={theme} />
        <CasualChips
          categories={allNavCategories}
          activeId={activeId}
          onChange={setActiveId}
        />

        <div className="px-3 py-3" style={{ backgroundColor: "var(--body-bg)" }}>
          {visibleItems.length === 0 ? (
            <p
              className="py-12 text-center text-sm"
              style={{ color: "var(--item-desc-color)" }}
            >
              No hay productos disponibles.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {visibleItems.map((item) => (
                <CasualCard key={item.id} item={item} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </main>
      <CasualFooter restaurant={restaurant} theme={theme} />
    </>
  );
}
