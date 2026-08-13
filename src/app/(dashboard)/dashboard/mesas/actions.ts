"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDeliveryTableSlug } from "@/lib/carta/table-urls";
import { tableFormSchema } from "@/lib/validations/table";
import { slugifyName } from "@/lib/utils/slug";

export type TableActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

async function getOwnerRestaurantId(): Promise<{
  supabase: ReturnType<typeof createClient>;
  restaurantId: string;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (restaurantError || !restaurant) return null;

  return { supabase, restaurantId: restaurant.id };
}

function getFieldErrors(
  flattened: { fieldErrors: Record<string, string[] | undefined> }
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(flattened.fieldErrors)
      .filter((entry): entry is [string, string[]] => !!entry[1]?.length)
      .map(([key, value]) => [key, value])
  );
}

function revalidateTablePaths() {
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/pedidos");
}

export async function createTableAction(
  _prev: TableActionState,
  formData: FormData
): Promise<TableActionState> {
  const parsed = tableFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugifyName(String(formData.get("name") ?? "")),
    isActive: formData.get("isActive") !== "false",
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const ctx = await getOwnerRestaurantId();
  if (!ctx) return { error: "No se encontró tu restaurante" };

  if (isDeliveryTableSlug(parsed.data.slug)) {
    return {
      error: "El identificador “delivery” está reservado. Usá el QR Delivery del Panel.",
    };
  }

  const { error } = await ctx.supabase.from("tables").insert({
    restaurant_id: ctx.restaurantId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    is_active: parsed.data.isActive,
  });

  if (error) {
    if (error.message.includes("tables_restaurant_slug_unique")) {
      return { error: "Ese identificador de mesa ya existe" };
    }
    console.error("createTableAction:", error.message);
    return { error: "No se pudo crear la mesa" };
  }

  revalidateTablePaths();
  return { success: "Mesa creada" };
}

export async function updateTableAction(
  _prev: TableActionState,
  formData: FormData
): Promise<TableActionState> {
  const tableId = formData.get("tableId")?.toString();
  if (!tableId) return { error: "Mesa no válida" };

  const parsed = tableFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    isActive: formData.get("isActive") !== "false",
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const ctx = await getOwnerRestaurantId();
  if (!ctx) return { error: "No se encontró tu restaurante" };

  if (isDeliveryTableSlug(parsed.data.slug)) {
    return {
      error: "El identificador “delivery” está reservado. Usá el QR Delivery del Panel.",
    };
  }

  const { error } = await ctx.supabase
    .from("tables")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      is_active: parsed.data.isActive,
    })
    .eq("id", tableId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    if (error.message.includes("tables_restaurant_slug_unique")) {
      return { error: "Ese identificador de mesa ya existe" };
    }
    console.error("updateTableAction:", error.message);
    return { error: "No se pudo actualizar la mesa" };
  }

  revalidateTablePaths();
  return { success: "Mesa actualizada" };
}

export async function deleteTableAction(tableId: string): Promise<TableActionState> {
  const ctx = await getOwnerRestaurantId();
  if (!ctx) return { error: "No se encontró tu restaurante" };

  const { data: table, error: lookupError } = await ctx.supabase
    .from("tables")
    .select("slug")
    .eq("id", tableId)
    .eq("restaurant_id", ctx.restaurantId)
    .maybeSingle();

  if (lookupError || !table) {
    return { error: "Mesa no encontrada" };
  }

  if (isDeliveryTableSlug(table.slug)) {
    return { error: "La mesa Delivery no se puede eliminar. Se gestiona desde el Panel." };
  }

  const { error } = await ctx.supabase
    .from("tables")
    .delete()
    .eq("id", tableId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    if (error.message.includes("orders_table_id_fkey")) {
      return { error: "No se puede eliminar: la mesa tiene pedidos asociados" };
    }
    console.error("deleteTableAction:", error.message);
    return { error: "No se pudo eliminar la mesa" };
  }

  revalidateTablePaths();
  return { success: "Mesa eliminada" };
}
