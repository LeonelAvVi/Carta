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

export type CloseTableOrdersResult = {
  error?: string;
  success?: string;
};

/** Marca todos los pedidos abiertos de la mesa como closed (cuenta cobrada / mesa libre). */
export async function closeTableOrdersAction(
  tableId: string
): Promise<CloseTableOrdersResult> {
  if (!tableId) {
    return { error: "Mesa no válida" };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Debes iniciar sesión" };
  }

  const access = await getRestaurantAccess();
  if (!access) {
    return { error: "No tienes permiso para cerrar esta mesa" };
  }

  const { data, error } = await supabase.rpc("close_restaurant_table", {
    p_table_id: tableId,
  });

  if (error) {
    console.error("closeTableOrdersAction:", error.message);
    const msg = error.message.toLowerCase();
    if (msg.includes("permiso")) {
      return { error: "No tienes permiso para cerrar esta mesa" };
    }
    if (msg.includes("sin entregar") || msg.includes("cancelar antes")) {
      return {
        error:
          "Hay pedidos sin entregar ni cancelar. Terminá o cancelá antes de cerrar la mesa.",
      };
    }
    if (msg.includes("check") || msg.includes("orders_status")) {
      return {
        error:
          "Falta aplicar la migración de estado closed en Supabase. Corré 20250539000000 y 20250542000000.",
      };
    }
    return { error: error.message || "No se pudo cerrar la mesa. Intentá de nuevo." };
  }

  const closedCount =
    data && typeof data === "object" && "closed_count" in data
      ? Number((data as { closed_count: unknown }).closed_count)
      : 0;

  revalidatePath("/dashboard/pedidos");
  revalidatePath("/dashboard/staff");

  if (!Number.isFinite(closedCount) || closedCount <= 0) {
    return { success: "La mesa ya estaba libre" };
  }

  return { success: "Mesa cerrada" };
}

export type GuestBillOrderItem = {
  name: string;
  quantity: number;
  line_total: number;
  variation_name?: string | null;
};

export type GuestBillOrder = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: GuestBillOrderItem[];
};

export type GuestTableOrderStatusResult = {
  status?: string;
  created_at?: string;
  bill_subtotal?: number;
  bill_total?: number;
  discount_amount?: number;
  discount_description?: string | null;
  order_count?: number;
  orders?: GuestBillOrder[];
  error?: string;
};

function parseGuestBillOrders(raw: unknown): GuestBillOrder[] {
  if (!Array.isArray(raw)) return [];

  const orders: GuestBillOrder[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.id !== "string") continue;

    const itemsRaw = Array.isArray(row.items) ? row.items : [];
    const items: GuestBillOrderItem[] = [];
    for (const item of itemsRaw) {
      if (!item || typeof item !== "object") continue;
      const line = item as Record<string, unknown>;
      if (typeof line.name !== "string") continue;
      const quantity =
        typeof line.quantity === "number"
          ? line.quantity
          : Number(line.quantity);
      const lineTotal =
        typeof line.line_total === "number"
          ? line.line_total
          : Number(line.line_total);
      items.push({
        name: line.name,
        quantity: Number.isFinite(quantity) ? quantity : 1,
        line_total: Number.isFinite(lineTotal) ? lineTotal : 0,
        variation_name:
          typeof line.variation_name === "string"
            ? line.variation_name
            : null,
      });
    }

    const total =
      typeof row.total === "number" ? row.total : Number(row.total);

    orders.push({
      id: row.id,
      status: typeof row.status === "string" ? row.status : "delivered",
      total: Number.isFinite(total) ? total : 0,
      created_at:
        typeof row.created_at === "string" ? row.created_at : "",
      items,
    });
  }

  return orders;
}

/** Estado del último pedido + total de cuenta abierta (carta pública / comensal). */
export async function getGuestTableOrderStatusAction(
  restaurantId: string,
  tableId: string
): Promise<GuestTableOrderStatusResult> {
  if (!restaurantId || !tableId) {
    return { error: "Datos incompletos" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_guest_table_order_status", {
    p_restaurant_id: restaurantId,
    p_table_id: tableId,
  });

  if (error) {
    console.error("getGuestTableOrderStatusAction:", error.message);
    return { error: "No se pudo consultar el pedido" };
  }

  if (!data || typeof data !== "object") {
    return {};
  }

  const row = data as {
    status?: unknown;
    created_at?: unknown;
    bill_subtotal?: unknown;
    bill_total?: unknown;
    discount_amount?: unknown;
    discount_description?: unknown;
    order_count?: unknown;
    orders?: unknown;
  };

  const toNumber = (value: unknown): number | undefined => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const n = Number(value);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  const billSubtotal = toNumber(row.bill_subtotal);
  const billTotal = toNumber(row.bill_total);
  const discountAmount = toNumber(row.discount_amount);
  const orderCount = toNumber(row.order_count);

  return {
    status: typeof row.status === "string" ? row.status : undefined,
    created_at:
      typeof row.created_at === "string" ? row.created_at : undefined,
    bill_subtotal:
      billSubtotal !== undefined && Number.isFinite(billSubtotal)
        ? billSubtotal
        : undefined,
    bill_total:
      billTotal !== undefined && Number.isFinite(billTotal)
        ? billTotal
        : undefined,
    discount_amount:
      discountAmount !== undefined && Number.isFinite(discountAmount)
        ? discountAmount
        : undefined,
    discount_description:
      typeof row.discount_description === "string"
        ? row.discount_description
        : null,
    order_count:
      orderCount !== undefined && Number.isFinite(orderCount)
        ? orderCount
        : undefined,
    orders: parseGuestBillOrders(row.orders),
  };
}

export type TableAssistanceResult = {
  kind?: "waiter" | "bill" | null;
  requested_at?: string | null;
  error?: string;
  success?: string;
};

export async function getTableAssistanceAction(
  restaurantId: string,
  tableId: string
): Promise<TableAssistanceResult> {
  if (!restaurantId || !tableId) {
    return { error: "Datos incompletos" };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tables")
    .select("assistance_kind, assistance_requested_at")
    .eq("id", tableId)
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getTableAssistanceAction:", error.message);
    return { error: "No se pudo consultar" };
  }

  const kind = data?.assistance_kind;
  return {
    kind:
      kind === "waiter" || kind === "bill" ? kind : null,
    requested_at:
      typeof data?.assistance_requested_at === "string"
        ? data.assistance_requested_at
        : null,
  };
}

export async function requestTableAssistanceAction(
  restaurantId: string,
  tableId: string,
  kind: "waiter" | "bill"
): Promise<TableAssistanceResult> {
  if (!restaurantId || !tableId) {
    return { error: "Datos incompletos" };
  }
  if (kind !== "waiter" && kind !== "bill") {
    return { error: "Solicitud no válida" };
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("request_table_assistance", {
    p_restaurant_id: restaurantId,
    p_table_id: tableId,
    p_kind: kind,
  });

  if (error) {
    console.error("requestTableAssistanceAction:", error.message);
    return { error: "No se pudo avisar al local. Intentá de nuevo." };
  }

  return {
    success:
      kind === "bill"
        ? "Listo: pedimos la cuenta. Un mesero te atenderá."
        : "Listo: llamamos a un mesero.",
    kind,
    requested_at: new Date().toISOString(),
  };
}

export async function clearTableAssistanceAction(
  tableId: string
): Promise<TableAssistanceResult> {
  if (!tableId) {
    return { error: "Mesa no válida" };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Debes iniciar sesión" };
  }

  const access = await getRestaurantAccess();
  if (!access) {
    return { error: "No tienes permiso" };
  }

  const { error } = await supabase.rpc("clear_table_assistance", {
    p_table_id: tableId,
  });

  if (error) {
    console.error("clearTableAssistanceAction:", error.message);
    return { error: "No se pudo marcar como atendido" };
  }

  revalidatePath("/dashboard/staff");
  return { success: "Atendido", kind: null, requested_at: null };
}

export type SetTableDiscountResult = {
  error?: string;
  success?: string;
  amount?: number;
  description?: string | null;
};

export async function setTableDiscountAction(
  tableId: string,
  amount: number,
  description: string
): Promise<SetTableDiscountResult> {
  if (!tableId) {
    return { error: "Mesa no válida" };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Debes iniciar sesión" };
  }

  const access = await getRestaurantAccess();
  if (!access) {
    return { error: "No tienes permiso" };
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    return { error: "Monto de descuento no válido" };
  }

  if (parsedAmount > 0 && !description.trim()) {
    return { error: "Indicá una descripción del descuento" };
  }

  const { data, error } = await supabase.rpc("set_table_discount", {
    p_table_id: tableId,
    p_amount: parsedAmount,
    p_description: description,
  });

  if (error) {
    console.error("setTableDiscountAction:", error.message);
    const msg = error.message.toLowerCase();
    if (msg.includes("descripción")) {
      return { error: "Indicá una descripción del descuento" };
    }
    if (msg.includes("negativo")) {
      return { error: "El descuento no puede ser negativo" };
    }
    return { error: "No se pudo guardar el descuento" };
  }

  // Sin revalidatePath: el mostrador ya actualiza estado local + poll;
  // revalidar pisaba el descuento con un RSC cacheado sin el monto.

  const row =
    data && typeof data === "object"
      ? (data as { amount?: unknown; description?: unknown; cleared?: unknown })
      : null;

  const savedAmount =
    typeof row?.amount === "number"
      ? row.amount
      : typeof row?.amount === "string"
        ? Number(row.amount)
        : parsedAmount;

  return {
    success: savedAmount > 0 ? "Descuento guardado" : "Descuento quitado",
    amount: Number.isFinite(savedAmount) ? savedAmount : 0,
    description:
      typeof row?.description === "string" ? row.description : null,
  };
}
