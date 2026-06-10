"use client";

import { useMemo, useState } from "react";
import { AtrevidaFooter } from "@/components/carta-publica/templates/atrevida/atrevida-footer";
import { AtrevidaHeader } from "@/components/carta-publica/templates/atrevida/atrevida-header";
import { AtrevidaItemList } from "@/components/carta-publica/templates/atrevida/atrevida-item-list";
import { AtrevidaSidebar } from "@/components/carta-publica/templates/atrevida/atrevida-sidebar";
import type { CartaTemplateProps } from "@/lib/carta/template-types";

export function AtrevidaCarta({ restaurant, theme, sections }: CartaTemplateProps) {
  const { allNavCategories } = sections;
  const [activeId, setActiveId] = useState(allNavCategories[0]?.id ?? "");

  const activeCategory = useMemo(
    () => allNavCategories.find((category) => category.id === activeId) ?? null,
    [activeId, allNavCategories]
  );

  if (allNavCategories.length === 0) {
    return (
      <>
        <main>
          <AtrevidaHeader restaurant={restaurant} theme={theme} />
          <p
            className="px-4 py-16 text-center text-sm"
            style={{ color: "var(--item-desc-color)", backgroundColor: "var(--body-bg)" }}
          >
            Este restaurante aún no tiene productos disponibles.
          </p>
        </main>
        <AtrevidaFooter theme={theme} />
      </>
    );
  }

  return (
    <>
      <main style={{ backgroundColor: "var(--body-bg)" }}>
        <AtrevidaHeader restaurant={restaurant} theme={theme} />

        <div className="flex min-h-[280px]">
          <AtrevidaSidebar
            categories={allNavCategories}
            activeId={activeId || allNavCategories[0].id}
            onChange={setActiveId}
          />
          <AtrevidaItemList
            category={activeCategory ?? allNavCategories[0]}
            theme={theme}
          />
        </div>
      </main>
      <AtrevidaFooter theme={theme} />
    </>
  );
}
