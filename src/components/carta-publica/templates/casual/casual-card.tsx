import Image from "next/image";
import { AddToCartControl } from "@/components/carta-publica/add-to-cart-control";
import type { MenuItemRow, RestaurantThemeRow } from "@/lib/types";
import { getPublicItemPriceLabel } from "@/lib/carta/item-price";
import { formatPriceBs } from "@/lib/utils";

type CasualCardProps = {
  item: MenuItemRow;
  theme: RestaurantThemeRow;
};

export function CasualCard({ item, theme }: CasualCardProps) {
  const hasVariations = item.item_variations.length > 0;

  return (
    <article
      className="overflow-hidden rounded-[10px] border"
      style={{
        backgroundColor: "var(--item-bg)",
        borderColor: "var(--item-border)",
      }}
    >
      {item.image_url ? (
        <div className="relative h-[72px] w-full">
          <Image src={item.image_url} alt={item.name} fill sizes="160px" className="object-cover" />
        </div>
      ) : (
        <div
          className="flex h-[72px] items-center justify-center text-2xl"
          style={{ backgroundColor: "var(--item-image-placeholder-bg)" }}
          aria-hidden
        >
          🍽️
        </div>
      )}

      <div className="p-2">
        {item.is_featured ? (
          <span
            className="mb-1 inline-block rounded px-1.5 py-0.5 text-[8px] font-semibold"
            style={{
              backgroundColor: "var(--badge-featured-bg)",
              color: "var(--badge-featured-text)",
            }}
          >
            {theme.badge_featured_label}
          </span>
        ) : null}

        <h3
          className="line-clamp-2 text-[11px] font-bold leading-tight"
          style={{ color: "var(--item-name-color)" }}
        >
          {item.name}
        </h3>

        {item.description ? (
          <p
            className="mt-0.5 line-clamp-2 text-[9px] leading-snug"
            style={{ color: "var(--item-desc-color)" }}
          >
            {item.description}
          </p>
        ) : null}

        {hasVariations ? (
          <ul className="mt-2 flex flex-col gap-1">
            {item.item_variations.map((variation) => (
              <li
                key={variation.id}
                className="flex items-center justify-between gap-1 rounded px-1.5 py-0.5 text-[9px]"
                style={{
                  backgroundColor: "var(--variation-bg)",
                  color: "var(--variation-text)",
                }}
              >
                <span className="truncate">{variation.name}</span>
                <span
                  className="shrink-0 font-semibold tabular-nums"
                  style={{ color: "var(--variation-price)" }}
                >
                  {formatPriceBs(Number(variation.price))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="mt-1.5 text-[13px] font-bold tabular-nums"
            style={{ color: "var(--item-price-color)" }}
          >
            {getPublicItemPriceLabel(item)}
          </p>
        )}

        <AddToCartControl item={item} className="mt-2" compact />
      </div>
    </article>
  );
}
