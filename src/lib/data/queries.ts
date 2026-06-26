import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  CategoryRow,
  CategoryWithProducts,
  DashboardStats,
  MenuItemRow,
  PeriodSalesReport,
  ProfileRow,
  RestaurantRow,
  SubscriptionRow,
  TopProductRow,
} from "@/lib/types";
import { normalizeMenuItemVariations } from "@/lib/utils/menu-item";

async function getAuthenticatedClient() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getCurrentProfile:", error.message);
    return null;
  }

  return data;
});

export const getOwnerRestaurant = cache(async (): Promise<RestaurantRow | null> => {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return null;

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id, owner_id, name, slug, description, logo_url, primary_color, address, phone, is_active, created_at"
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getOwnerRestaurant:", error.message);
    return null;
  }

  return data;
});

export const getRestaurantSubscription = cache(
  async (restaurantId: string): Promise<SubscriptionRow | null> => {
    const { supabase, user } = await getAuthenticatedClient();
    if (!user) return null;

    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        "id, restaurant_id, plan, status, trial_ends_at, current_period_end, created_at"
      )
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (error) {
      console.error("getRestaurantSubscription:", error.message);
      return null;
    }

    return data;
  }
);

export const getDashboardStats = cache(
  async (restaurantId: string | null): Promise<DashboardStats> => {
    const empty: DashboardStats = {
      categoriesCount: 0,
      menuItemsCount: 0,
      cartaViewsCount: 0,
      availableMenuItemsCount: 0,
    };

    if (!restaurantId) return empty;

    const { supabase, user } = await getAuthenticatedClient();
    if (!user) return empty;

    const [categories, menuItems, views, availableItems] = await Promise.all([
      supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId),
      supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId),
      supabase
        .from("carta_views")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId),
      supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("is_available", true),
    ]);

    if (categories.error) console.error("categories count:", categories.error.message);
    if (menuItems.error) console.error("menu_items count:", menuItems.error.message);
    if (views.error) console.error("carta_views count:", views.error.message);
    if (availableItems.error) {
      console.error("available menu_items count:", availableItems.error.message);
    }

    return {
      categoriesCount: categories.count ?? 0,
      menuItemsCount: menuItems.count ?? 0,
      cartaViewsCount: views.count ?? 0,
      availableMenuItemsCount: availableItems.count ?? 0,
    };
  }
);

export const getRestaurantCategories = cache(
  async (restaurantId: string): Promise<CategoryRow[]> => {
    const { supabase, user } = await getAuthenticatedClient();
    if (!user) return [];

    const { data, error } = await supabase
      .from("categories")
      .select("id, restaurant_id, name, position, is_active, is_favorite, favorite_position")
      .eq("restaurant_id", restaurantId)
      .order("is_favorite", { ascending: false })
      .order("favorite_position", { ascending: true, nullsFirst: false })
      .order("position", { ascending: true });

    if (error) {
      console.error("getRestaurantCategories:", error.message);
      return [];
    }

    return data ?? [];
  }
);

export const getCategoriesWithProducts = cache(
  async (restaurantId: string): Promise<CategoryWithProducts[]> => {
    const { supabase, user } = await getAuthenticatedClient();
    if (!user) return [];

    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, restaurant_id, name, position, is_active, is_favorite, favorite_position")
      .eq("restaurant_id", restaurantId)
      .order("is_favorite", { ascending: false })
      .order("favorite_position", { ascending: true, nullsFirst: false })
      .order("position", { ascending: true });

    if (catError) {
      console.error("getCategoriesWithProducts categories:", catError.message);
      return [];
    }

    if (!categories?.length) return [];

    const { data: items, error: itemsError } = await supabase
      .from("menu_items")
      .select(
        "id, category_id, restaurant_id, name, description, price, variations, image_url, is_available, is_featured, position, created_at"
      )
      .eq("restaurant_id", restaurantId)
      .order("position", { ascending: true });

    if (itemsError) {
      console.error("getCategoriesWithProducts items:", itemsError.message);
      return categories.map((c) => ({ ...c, menu_items: [] }));
    }

    const itemsByCategory = new Map<string, MenuItemRow[]>();
    for (const item of items ?? []) {
      const normalized: MenuItemRow = {
        ...item,
        is_featured: item.is_featured ?? false,
        variations: normalizeMenuItemVariations(item.variations),
        item_variations: [],
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

export function getPublicCartaUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (base) return `${base}/carta/${slug}`;
  return `/carta/${slug}`;
}

export const getTopProductsByPeriod = cache(
  async (
    restaurantId: string,
    year: number,
    month: number
  ): Promise<PeriodSalesReport | null> => {
    const { supabase, user } = await getAuthenticatedClient();
    if (!user) return null;

    const { data, error } = await supabase.rpc("get_top_products_by_period", {
      p_restaurant_id: restaurantId,
      p_year: year,
      p_month: month,
    });

    if (error) {
      console.error("getTopProductsByPeriod:", error.message);
      return null;
    }

    if (!data || typeof data !== "object") {
      return { products: [], total_revenue: 0, order_count: 0 };
    }

    const payload = data as {
      products?: TopProductRow[] | null;
      total_revenue?: number | string;
      order_count?: number | string;
    };

    return {
      products: (payload.products ?? []).map((row) => ({
        menu_item_id: row.menu_item_id,
        name: row.name,
        total_quantity: Number(row.total_quantity),
        total_revenue: Number(row.total_revenue),
        rank: row.rank,
      })),
      total_revenue: Number(payload.total_revenue ?? 0),
      order_count: Number(payload.order_count ?? 0),
    };
  }
);

export const PLAN_LABELS: Record<SubscriptionRow["plan"], string> = {
  trial: "Trial (gratis)",
  basic: "Básico",
  pro: "Pro",
  premium: "Premium",
};
