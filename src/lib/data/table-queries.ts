import { cache } from "react";
import {
  DELIVERY_TABLE_NAME,
  DELIVERY_TABLE_SLUG,
} from "@/lib/carta/table-urls";
import { createClient } from "@/lib/supabase/server";
import type { OrderItemRow, OrderRow, OrderWithTable, TableRow } from "@/lib/types";
import { mapOrderWithTable, ORDER_WITH_TABLE_SELECT } from "@/lib/data/order-mappers";

export const getTableBySlug = cache(
  async (
    restaurantId: string,
    tableSlug: string
  ): Promise<TableRow | null> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("tables")
      .select("id, restaurant_id, name, slug, is_active, assistance_kind, assistance_requested_at, discount_amount, discount_description, created_at, updated_at")
      .eq("restaurant_id", restaurantId)
      .eq("slug", tableSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("getTableBySlug:", error.message);
      return null;
    }

    return data;
  }
);

export const getOwnerTables = cache(async (): Promise<TableRow[]> => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (restaurantError || !restaurant) return [];

  const { data, error } = await supabase
    .from("tables")
    .select("id, restaurant_id, name, slug, is_active, assistance_kind, assistance_requested_at, discount_amount, discount_description, created_at, updated_at")
    .eq("restaurant_id", restaurant.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("getOwnerTables:", error.message);
    return [];
  }

  return data ?? [];
});

/** Mesa reservada para pedidos delivery (slug fijo). La crea si no existe. */
export async function ensureDeliveryTable(
  restaurantId: string
): Promise<TableRow | null> {
  const supabase = createClient();

  const { data: existing, error: existingError } = await supabase
    .from("tables")
    .select("id, restaurant_id, name, slug, is_active, assistance_kind, assistance_requested_at, discount_amount, discount_description, created_at, updated_at")
    .eq("restaurant_id", restaurantId)
    .eq("slug", DELIVERY_TABLE_SLUG)
    .maybeSingle();

  if (existingError) {
    console.error("ensureDeliveryTable lookup:", existingError.message);
    return null;
  }

  if (existing) {
    if (!existing.is_active) {
      const { data: reactivated, error: reactivateError } = await supabase
        .from("tables")
        .update({ is_active: true, name: DELIVERY_TABLE_NAME })
        .eq("id", existing.id)
        .select("id, restaurant_id, name, slug, is_active, assistance_kind, assistance_requested_at, discount_amount, discount_description, created_at, updated_at")
        .single();

      if (reactivateError) {
        console.error("ensureDeliveryTable reactivate:", reactivateError.message);
        return existing;
      }
      return reactivated;
    }
    return existing;
  }

  const { data: created, error: createError } = await supabase
    .from("tables")
    .insert({
      restaurant_id: restaurantId,
      name: DELIVERY_TABLE_NAME,
      slug: DELIVERY_TABLE_SLUG,
      is_active: true,
    })
    .select("id, restaurant_id, name, slug, is_active, assistance_kind, assistance_requested_at, discount_amount, discount_description, created_at, updated_at")
    .single();

  if (createError) {
    console.error("ensureDeliveryTable create:", createError.message);
    return null;
  }

  return created;
}

export const getOwnerOrders = cache(
  async (statusFilter?: OrderRow["status"]): Promise<OrderWithTable[]> => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return [];

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (restaurantError || !restaurant) return [];

    let query = supabase
      .from("orders")
      .select(ORDER_WITH_TABLE_SELECT)
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("getOwnerOrders:", error.message);
      return [];
    }

    return (data ?? []).map((row) => mapOrderWithTable(row));
  }
);
