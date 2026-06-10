import type { MenuItemRow } from "@/lib/types";
import { formatPriceBs } from "@/lib/utils";
import { formatMenuItemPriceLabel } from "@/lib/utils/menu-item";

export function getPublicItemPriceLabel(item: MenuItemRow): string {
  if (item.item_variations.length > 0) {
    const prices = item.item_variations.map((v) => Number(v.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatPriceBs(min);
    return `${formatPriceBs(min)} – ${formatPriceBs(max)}`;
  }

  return formatMenuItemPriceLabel(item);
}
