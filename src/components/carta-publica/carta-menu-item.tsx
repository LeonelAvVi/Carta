import Image from "next/image";
import { AddToCartControl } from "@/components/carta-publica/add-to-cart-control";
import type { MenuItemRow, RestaurantThemeRow } from "@/lib/types";
import { formatPriceBs } from "@/lib/utils";

type CartaMenuItemProps = {
  item: MenuItemRow;
  theme: RestaurantThemeRow;
};

export function CartaMenuItem({ item, theme }: CartaMenuItemProps) {
  const variations = item.item_variations.length > 0 ? item.item_variations : [];
  const hasVariations = variations.length > 0;

  return (
    <article
      className="flex gap-3 py-4 last:pb-0"
      style={{
        backgroundColor: "var(--item-bg)",
        borderBottom: "0.5px solid var(--item-border)",
      }}
    >
      {item.image_url ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg text-lg text-[color:var(--item-desc-color)]"
          style={{ backgroundColor: "var(--item-image-placeholder-bg)" }}
          aria-hidden
        >
          📷
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-base font-semibold leading-snug"
            style={{ color: "var(--item-name-color)" }}
          >
            {item.name}
          </h3>
          {!hasVariations && item.price != null ? (
            <p
              className="shrink-0 text-sm font-semibold tabular-nums"
              style={{ color: "var(--item-price-color)" }}
            >
              {formatPriceBs(Number(item.price))}
            </p>
          ) : null}
        </div>

        {item.description ? (
          <p
            className="mt-1 text-sm leading-relaxed"
            style={{ color: "var(--item-desc-color)" }}
          >
            {item.description}
          </p>
        ) : null}

        {item.is_featured ? (
          <span
            className="mt-2 inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--badge-featured-bg)",
              color: "var(--badge-featured-text)",
            }}
          >
            {theme.badge_featured_label}
          </span>
        ) : null}

        {hasVariations ? (
          <ul className="mt-3 flex flex-col gap-1.5">
            {variations.map((variation) => (
              <li
                key={variation.id}
                className="flex items-center justify-between gap-3 rounded px-2 py-1 text-sm"
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

        <AddToCartControl item={item} className="mt-3" />
      </div>
    </article>
  );
}
