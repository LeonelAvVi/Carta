import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  CategoryWithProducts,
  ItemVariationRow,
  MenuItemRow,
  RestaurantRow,
} from "@/lib/types";
import { normalizeMenuItemVariations } from "@/lib/utils/menu-item";

export type PublicCartaSections = {
  favorites: CategoryWithProducts[];
  categories: CategoryWithProducts[];
  allNavCategories: CategoryWithProducts[];
};

export const getRestaurantBySlug = cache(
  async (slug: string): Promise<RestaurantRow | null> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select(
        "id, owner_id, name, slug, description, logo_url, primary_color, address, phone, is_active, created_at"
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("getRestaurantBySlug:", error.message);
      return null;
    }

    return data;
  }
);

async function fetchItemVariationsByMenuItem(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string
): Promise<Map<string, ItemVariationRow[]>> {
  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true);

  if (itemsError || !items?.length) {
    return new Map();
  }

  const itemIds = items.map((item) => item.id);

  const { data: variations, error: varError } = await supabase
    .from("item_variations")
    .select("id, menu_item_id, name, price, position, is_available")
    .in("menu_item_id", itemIds)
    .eq("is_available", true)
    .order("position", { ascending: true });

  if (varError) {
    console.error("fetchItemVariationsByMenuItem:", varError.message);
    return new Map();
  }

  const map = new Map<string, ItemVariationRow[]>();
  for (const variation of variations ?? []) {
    const list = map.get(variation.menu_item_id) ?? [];
    list.push({
      ...variation,
      price: Number(variation.price),
    });
    map.set(variation.menu_item_id, list);
  }

  return map;
}

export const getPublicCategoriesWithProducts = cache(
  async (restaurantId: string): Promise<CategoryWithProducts[]> => {
    const supabase = createClient();

    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select(
        "id, restaurant_id, name, position, is_active, is_favorite, favorite_position"
      )
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("is_favorite", { ascending: false })
      .order("favorite_position", { ascending: true, nullsFirst: false })
      .order("position", { ascending: true });

    if (catError) {
      console.error("getPublicCategoriesWithProducts categories:", catError.message);
      return [];
    }

    if (!categories?.length) return [];

    const [variationsByItem, itemsResult] = await Promise.all([
      fetchItemVariationsByMenuItem(supabase, restaurantId),
      supabase
        .from("menu_items")
        .select(
          "id, category_id, restaurant_id, name, description, price, variations, image_url, is_available, is_featured, position, created_at"
        )
        .eq("restaurant_id", restaurantId)
        .eq("is_available", true)
        .order("position", { ascending: true }),
    ]);

    const { data: items, error: itemsError } = itemsResult;

    if (itemsError) {
      console.error("getPublicCategoriesWithProducts items:", itemsError.message);
      return categories.map((category) => ({ ...category, menu_items: [] }));
    }

    const itemsByCategory = new Map<string, MenuItemRow[]>();
    for (const item of items ?? []) {
      const itemVariations = variationsByItem.get(item.id) ?? [];
      const normalized: MenuItemRow = {
        ...item,
        is_featured: item.is_featured ?? false,
        variations: normalizeMenuItemVariations(item.variations),
        item_variations: itemVariations,
      };
      const list = itemsByCategory.get(item.category_id) ?? [];
      list.push(normalized);
      itemsByCategory.set(item.category_id, list);
    }

    return categories.map((category) => ({
      ...category,
      menu_items: itemsByCategory.get(category.id) ?? [],
    }));
  }
);

export function splitPublicCartaCategories(
  categories: CategoryWithProducts[]
): PublicCartaSections {
  const withItems = categories.filter((category) => category.menu_items.length > 0);

  const favorites = withItems
    .filter((category) => category.is_favorite)
    .sort((a, b) => (a.favorite_position ?? 0) - (b.favorite_position ?? 0));

  const regular = withItems
    .filter((category) => !category.is_favorite)
    .sort((a, b) => a.position - b.position);

  return {
    favorites,
    categories: regular,
    allNavCategories: [...favorites, ...regular],
  };
}

export async function recordCartaView(
  restaurantId: string,
  userAgent: string | null
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("carta_views").insert({
    restaurant_id: restaurantId,
    user_agent: userAgent,
  });

  if (error) {
    console.error("recordCartaView:", error.message);
  }
}
