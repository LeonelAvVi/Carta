import type { MenuItemRow, MenuItemVariation } from "@/lib/types";
import { menuItemVariationsSchema } from "@/lib/validations/menu-item";
import { formatPriceBs } from "@/lib/utils";

export function normalizeMenuItemVariations(
  raw: unknown
): MenuItemVariation[] {
  const parsed = menuItemVariationsSchema.safeParse(raw ?? []);
  return parsed.success ? parsed.data : [];
}

export function formatMenuItemPriceLabel(item: MenuItemRow): string {
  const variations = normalizeMenuItemVariations(item.variations);

  if (variations.length > 0) {
    const prices = variations.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatPriceBs(min);
    return `${formatPriceBs(min)} – ${formatPriceBs(max)}`;
  }

  return formatPriceBs(item.price != null ? Number(item.price) : null);
}
