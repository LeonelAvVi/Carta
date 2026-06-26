import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { mapOrderWithTable, ORDER_WITH_TABLE_SELECT } from "@/lib/data/order-mappers";
import type { OrderWithTable, RestaurantEmployeeWithProfile, TableRow } from "@/lib/types";

export const getRestaurantTables = cache(
  async (restaurantId: string): Promise<TableRow[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("tables")
      .select("id, restaurant_id, name, slug, is_active, created_at, updated_at")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("getRestaurantTables:", error.message);
      return [];
    }

    return data ?? [];
  }
);

export const getRestaurantOrders = cache(
  async (restaurantId: string): Promise<OrderWithTable[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_WITH_TABLE_SELECT)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("getRestaurantOrders:", error.message);
      return [];
    }

    return (data ?? []).map((row) => mapOrderWithTable(row));
  }
);

export const getRestaurantEmployees = cache(
  async (restaurantId: string): Promise<RestaurantEmployeeWithProfile[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("restaurant_employees")
      .select(
        `
        id, restaurant_id, profile_id, created_at,
        profile:profiles ( id, full_name, email )
      `
      )
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("getRestaurantEmployees:", error.message);
      return [];
    }

    return (data ?? []).map((row) => {
      const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
      return {
        id: row.id,
        restaurant_id: row.restaurant_id,
        profile_id: row.profile_id,
        created_at: row.created_at,
        profile: profile as RestaurantEmployeeWithProfile["profile"],
      };
    });
  }
);
