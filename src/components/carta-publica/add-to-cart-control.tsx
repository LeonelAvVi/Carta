"use client";

import { useState } from "react";
import { useCartaCart } from "@/components/carta-publica/carta-cart-provider";
import type { MenuItemRow } from "@/lib/types";
import { cn, formatPriceBs } from "@/lib/utils";

type AddToCartControlProps = {
  item: MenuItemRow;
  className?: string;
  compact?: boolean;
};

export function AddToCartControl({
  item,
  className,
  compact = false,
}: AddToCartControlProps) {
  const { table, addItem } = useCartaCart();
  const [variationId, setVariationId] = useState(
    item.item_variations[0]?.id ?? ""
  );

  if (!table) return null;

  const variations = item.item_variations;
  const hasVariations = variations.length > 0;

  function handleAdd() {
    if (hasVariations) {
      const variation = variations.find((v) => v.id === variationId);
      if (!variation) return;
      addItem({
        menu_item_id: item.id,
        name: item.name,
        unit_price: Number(variation.price),
        variation_id: variation.id,
        variation_name: variation.name,
        image_url: item.image_url,
      });
      return;
    }

    if (item.price == null) return;

    addItem({
      menu_item_id: item.id,
      name: item.name,
      unit_price: Number(item.price),
      image_url: item.image_url,
    });
  }

  const canAdd = hasVariations ? Boolean(variationId) : item.price != null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {hasVariations ? (
        <select
          value={variationId}
          onChange={(e) => setVariationId(e.target.value)}
          className="h-9 w-full rounded-lg border px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tab-active-bg)]"
          style={{
            borderColor: "var(--item-border)",
            backgroundColor: "var(--item-bg)",
            color: "var(--item-name-color)",
          }}
        >
          {variations.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {formatPriceBs(Number(v.price))}
            </option>
          ))}
        </select>
      ) : null}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "active:scale-[0.98] motion-safe:duration-150",
          compact ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"
        )}
        style={{
          backgroundColor: "var(--tab-active-bg)",
          color: "var(--tab-active-text)",
        }}
      >
        Agregar
      </button>
    </div>
  );
}
