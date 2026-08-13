import type { OrderItemRow, OrderRow, OrderWithTable } from "@/lib/types";

export function isActiveOrderStatus(status: OrderRow["status"]): boolean {
  return (
    status !== "delivered" &&
    status !== "cancelled" &&
    status !== "closed"
  );
}

export function getActiveOrdersForTable(
  orders: OrderWithTable[],
  tableId: string
): OrderWithTable[] {
  return orders.filter(
    (order) => order.table_id === tableId && isActiveOrderStatus(order.status)
  );
}

/** Pedidos entregados: son los que cuentan para la cuenta a cobrar. */
export function getBillOrdersForTable(
  orders: OrderWithTable[],
  tableId: string
): OrderWithTable[] {
  return orders.filter(
    (order) => order.table_id === tableId && order.status === "delivered"
  );
}

/** Cancelados de la sesión abierta (aún no closed): se muestran, no suman. */
export function getCancelledOrdersForTable(
  orders: OrderWithTable[],
  tableId: string
): OrderWithTable[] {
  return orders.filter(
    (order) => order.table_id === tableId && order.status === "cancelled"
  );
}

/** Mesa ocupada mientras tenga pedidos abiertos (no cerrados; cancelados solos no ocupan). */
export function getOccupiedTableIds(orders: OrderWithTable[]): Set<string> {
  return new Set(
    orders
      .filter(
        (order) =>
          order.status !== "cancelled" && order.status !== "closed"
      )
      .map((order) => order.table_id)
  );
}

/** Solo se puede cerrar si no quedan pedidos en cocina/curso. */
export function canCloseTableSession(
  orders: OrderWithTable[],
  tableId: string
): { ok: true } | { ok: false; reason: string } {
  const active = getActiveOrdersForTable(orders, tableId);
  if (active.length > 0) {
    return {
      ok: false,
      reason: `Hay ${active.length} pedido${active.length === 1 ? "" : "s"} sin entregar ni cancelar. Terminá o cancelá antes de cerrar la mesa.`,
    };
  }

  const bill = getBillOrdersForTable(orders, tableId);
  const cancelled = getCancelledOrdersForTable(orders, tableId);

  // Entregados a cobrar, o solo cancelados (el cliente se fue sin consumir)
  if (bill.length === 0 && cancelled.length === 0) {
    return {
      ok: false,
      reason: "No hay nada que cerrar en esta mesa.",
    };
  }

  return { ok: true };
}

export type TableBillLine = {
  key: string;
  name: string;
  quantity: number;
  line_total: number;
};

export type TableBill = {
  lines: TableBillLine[];
  /** Suma de pedidos entregados (sin descuento). */
  subtotal: number;
  /** Alias de subtotal para compatibilidad; preferir payable para cobrar. */
  total: number;
  discountAmount: number;
  discountDescription: string | null;
  /** Total a cobrar = max(0, subtotal - discount). */
  payable: number;
  orderCount: number;
};

function lineKey(item: OrderItemRow): string {
  return `${item.menu_item_id}:${item.variation_id ?? ""}:${item.name}:${item.variation_name ?? ""}`;
}

function lineDisplayName(item: OrderItemRow): string {
  return item.variation_name
    ? `${item.name} (${item.variation_name})`
    : item.name;
}

/** Agrupa ítems de pedidos entregados y calcula el total a cobrar. */
export function buildTableBill(
  orders: OrderWithTable[],
  discount?: { amount?: number | null; description?: string | null }
): TableBill {
  const map = new Map<string, TableBillLine>();

  for (const order of orders) {
    for (const item of order.items) {
      const key = lineKey(item);
      const existing = map.get(key);
      if (existing) {
        existing.quantity += item.quantity;
        existing.line_total += Number(item.line_total);
      } else {
        map.set(key, {
          key,
          name: lineDisplayName(item),
          quantity: item.quantity,
          line_total: Number(item.line_total),
        });
      }
    }
  }

  const lines = Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es")
  );
  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const rawDiscount = Number(discount?.amount ?? 0);
  const discountAmount =
    Number.isFinite(rawDiscount) && rawDiscount > 0 ? rawDiscount : 0;
  const payable = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  return {
    lines,
    subtotal,
    total: subtotal,
    discountAmount,
    discountDescription: discount?.description?.trim() || null,
    payable,
    orderCount: orders.length,
  };
}
