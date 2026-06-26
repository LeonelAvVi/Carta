import type { OrderRow, OrderWithTable } from "@/lib/types";

export function isActiveOrderStatus(status: OrderRow["status"]): boolean {
  return status !== "delivered" && status !== "cancelled";
}

export function getActiveOrdersForTable(
  orders: OrderWithTable[],
  tableId: string
): OrderWithTable[] {
  return orders.filter(
    (order) => order.table_id === tableId && isActiveOrderStatus(order.status)
  );
}

export function getOccupiedTableIds(orders: OrderWithTable[]): Set<string> {
  return new Set(
    orders.filter((order) => isActiveOrderStatus(order.status)).map((order) => order.table_id)
  );
}
