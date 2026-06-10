import type { CategoryWithProducts, RestaurantThemeRow } from "@/lib/types";
import { getPublicItemPriceLabel } from "@/lib/carta/item-price";
import { formatPriceBs } from "@/lib/utils";

type AtrevidaItemListProps = {
  category: CategoryWithProducts | null;
  theme: RestaurantThemeRow;
};

export function AtrevidaItemList({ category, theme }: AtrevidaItemListProps) {
  if (!category) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-xs" style={{ color: "var(--item-desc-color)" }}>
          Selecciona una categoría
        </p>
      </div>
    );
  }

  if (category.menu_items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-xs" style={{ color: "var(--item-desc-color)" }}>
          Sin productos en esta categoría
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 px-2.5 py-3">
      <h2
        className="mb-2.5 border-b pb-1.5 text-[11px] font-bold font-display"
        style={{
          color: "var(--category-title-color)",
          borderColor: "color-mix(in srgb, var(--tab-active-bg) 35%, transparent)",
        }}
      >
        {category.name}
      </h2>

      <ul>
        {category.menu_items.map((item) => {
          const hasVariations = item.item_variations.length > 0;

          return (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 border-b py-2 last:border-b-0"
              style={{ borderColor: "var(--item-border)" }}
            >
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--item-name-color)" }}
                >
                  {item.name}
                </h3>
                {item.description ? (
                  <p
                    className="mt-0.5 text-[9px] leading-snug"
                    style={{ color: "var(--item-desc-color)" }}
                  >
                    {item.description}
                  </p>
                ) : null}

                {item.is_featured ? (
                  <span
                    className="mt-1 inline-block rounded-sm px-1 py-px text-[8px] font-bold uppercase"
                    style={{
                      backgroundColor: "var(--tab-active-bg)",
                      color: "var(--tab-active-text)",
                    }}
                  >
                    {theme.badge_featured_label}
                  </span>
                ) : null}

                {hasVariations ? (
                  <ul className="mt-2 flex flex-col gap-1">
                    {item.item_variations.map((variation) => (
                      <li
                        key={variation.id}
                        className="flex items-center justify-between gap-2 rounded px-1.5 py-0.5 text-[9px]"
                        style={{
                          backgroundColor: "var(--variation-bg)",
                          color: "var(--variation-text)",
                        }}
                      >
                        <span>{variation.name}</span>
                        <span
                          className="shrink-0 font-semibold tabular-nums"
                          style={{ color: "var(--variation-price)" }}
                        >
                          {formatPriceBs(Number(variation.price))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {!hasVariations ? (
                <p
                  className="shrink-0 text-sm font-bold tabular-nums"
                  style={{ color: "var(--item-price-color)" }}
                >
                  {getPublicItemPriceLabel(item)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
