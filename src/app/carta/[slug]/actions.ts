"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantAccess } from "@/lib/data/restaurant-access";
import type { OrderItemRow } from "@/lib/types";
import {
  createOrderSchema,
  orderStatusSchema,
  type CreateOrderInput,
} from "@/lib/validations/order";

export type CreateOrderResult = {
  error?: string;
  success?: boolean;
  orderId?: string;
};

export type UpdateOrderStatusResult = {
  error?: string;
  success?: string;
};

async function buildOrderItemsFromDb(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string,
  inputItems: CreateOrderInput["items"]
): Promise<{ items: OrderItemRow[]; total: number } | { error: string }> {
  const menuItemIds = Array.from(new Set(inputItems.map((i) => i.menu_item_id)));

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("id, name, price, is_available")
    .eq("restaurant_id", restaurantId)
    .in("id", menuItemIds);

  if (menuError || !menuItems) {
    return { error: "No se pudieron validar los productos" };
  }

  const menuById = new Map(menuItems.map((item) => [item.id, item]));

  const variationIds = inputItems
    .map((i) => i.variation_id)
    .filter((id): id is string => Boolean(id));

  let variationsById = new Map<
    string,
    { id: string; menu_item_id: string; name: string; price: number; is_available: boolean }
  >();

  if (variationIds.length > 0) {
    const { data: variations, error: varError } = await supabase
      .from("item_variations")
      .select("id, menu_item_id, name, price, is_available")
      .in("id", variationIds);

    if (varError) {
      return { error: "No se pudieron validar las variaciones" };
    }

    variationsById = new Map((variations ?? []).map((v) => [v.id, { ...v, price: Number(v.price) }]));
  }

  const orderItems: OrderItemRow[] = [];
  let total = 0;

  for (const line of inputItems) {
    const menuItem = menuById.get(line.menu_item_id);
    if (!menuItem || !menuItem.is_available) {
      return { error: `El producto "${menuItem?.name ?? "seleccionado"}" no está disponible` };
    }

    let unitPrice: number;
    let variationName: string | null = null;
    let variationId: string | null = null;

    if (line.variation_id) {
      const variation = variationsById.get(line.variation_id);
      if (!variation || variation.menu_item_id !== line.menu_item_id || !variation.is_available) {
        return { error: `Variación no válida para "${menuItem.name}"` };
      }
      unitPrice = Number(variation.price);
      variationName = variation.name;
      variationId = variation.id;
    } else {
      if (menuItem.price == null) {
        return { error: `"${menuItem.name}" requiere elegir una variación` };
      }
      unitPrice = Number(menuItem.price);
    }

    const lineTotal = unitPrice * line.quantity;
    total += lineTotal;

    orderItems.push({
      menu_item_id: line.menu_item_id,
      name: menuItem.name,
      quantity: line.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      variation_id: variationId,
      variation_name: variationName,
    });
  }

  return { items: orderItems, total: Math.round(total * 100) / 100 };
}

export async function createOrderAction(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    return await createOrder(input);
  } catch (err) {
    console.error("createOrderAction:", err);
    return { error: "No se pudo enviar el pedido. Intenta de nuevo." };
  }
}

async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? "Pedido no válido" };
  }

  const supabase = createClient();

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, is_active")
    .eq("id", parsed.data.restaurant_id)
    .eq("is_active", true)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    return { error: "Restaurante no disponible" };
  }

  const { data: table, error: tableError } = await supabase
    .from("tables")
    .select("id, restaurant_id, is_active")
    .eq("id", parsed.data.table_id)
    .eq("restaurant_id", parsed.data.restaurant_id)
    .eq("is_active", true)
    .maybeSingle();

  if (tableError || !table) {
    return { error: "Mesa no válida o inactiva" };
  }

  const built = await buildOrderItemsFromDb(
    supabase,
    parsed.data.restaurant_id,
    parsed.data.items
  );

  if ("error" in built) {
    return { error: built.error };
  }

  // Sin .select(): anon tiene INSERT pero no SELECT en orders (RLS intencional).
  const { error: insertError } = await supabase.from("orders").insert({
    restaurant_id: parsed.data.restaurant_id,
    table_id: parsed.data.table_id,
    items: built.items,
    total: built.total,
    notes: parsed.data.notes ?? null,
    status: "pending",
  });

  if (insertError) {
    console.error("createOrderAction:", insertError.message);
    return { error: "No se pudo enviar el pedido. Intenta de nuevo." };
  }

  revalidatePath("/dashboard/pedidos");
  return { success: true };
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string
): Promise<UpdateOrderStatusResult> {
  const parsedStatus = orderStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { error: "Estado no válido" };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Debes iniciar sesión" };
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, restaurant_id")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !order) {
    return { error: "Pedido no encontrado" };
  }

  const access = await getRestaurantAccess();
  if (!access || access.restaurantId !== order.restaurant_id) {
    return { error: "No tienes permiso para actualizar este pedido" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: parsedStatus.data })
    .eq("id", orderId);

  if (error) {
    console.error("updateOrderStatusAction:", error.message);
    return { error: "No se pudo actualizar el estado" };
  }

  revalidatePath("/dashboard/pedidos");
  revalidatePath("/dashboard/staff");
  return { success: "Estado actualizado" };
}
