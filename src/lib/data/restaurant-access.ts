import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { RestaurantAccess, RestaurantRow } from "@/lib/types";

const RESTAURANT_SELECT =
  "id, owner_id, name, slug, description, logo_url, primary_color, address, phone, is_active, created_at";

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

export const getRestaurantAccess = cache(async (): Promise<RestaurantAccess | null> => {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return null;

  const { data: owned, error: ownedError } = await supabase
    .from("restaurants")
    .select(RESTAURANT_SELECT)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (ownedError) {
    console.error("getRestaurantAccess owner:", ownedError.message);
  }

  if (owned) {
    return {
      role: "owner",
      restaurantId: owned.id,
      restaurant: owned as RestaurantRow,
      userId: user.id,
    };
  }

  const { data: employment, error: employmentError } = await supabase
    .from("restaurant_employees")
    .select("restaurant_id")
    .eq("profile_id", user.id)
    .limit(1)
    .maybeSingle();

  if (employmentError) {
    console.error("getRestaurantAccess employee:", employmentError.message);
    return null;
  }

  if (!employment) return null;

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select(RESTAURANT_SELECT)
    .eq("id", employment.restaurant_id)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    console.error("getRestaurantAccess restaurant:", restaurantError?.message);
    return null;
  }

  return {
    role: "employee",
    restaurantId: restaurant.id,
    restaurant: restaurant as RestaurantRow,
    userId: user.id,
  };
});

export async function requireOwnerAccess(): Promise<RestaurantAccess> {
  const access = await getRestaurantAccess();
  if (!access || access.role !== "owner") {
    redirect("/dashboard/staff");
  }
  return access;
}

export async function requireStaffAccess(): Promise<RestaurantAccess> {
  const access = await getRestaurantAccess();
  if (!access) {
    redirect("/login");
  }
  return access;
}

export async function getPostLoginPath(): Promise<string> {
  const access = await getRestaurantAccess();
  if (access?.role === "employee") {
    return "/dashboard/staff";
  }
  return "/dashboard";
}

export function isEmployeeOnly(access: RestaurantAccess | null): boolean {
  return access?.role === "employee";
}
