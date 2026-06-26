import type { OrderItemRow, OrderRow, OrderWithTable } from "@/lib/types";

export const ORDER_WITH_TABLE_SELECT = `
  id, restaurant_id, table_id, items, status, total, notes, created_at, updated_at,
  table:tables ( id, name, slug )
`;

export type OrderRowDb = {
  id: string;
  restaurant_id: string;
  table_id: string;
  items: unknown;
  status: OrderRow["status"];
  total: number | string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  table: OrderWithTable["table"] | OrderWithTable["table"][] | null;
};

export function mapOrderWithTable(row: OrderRowDb): OrderWithTable {
  const table = Array.isArray(row.table) ? row.table[0] : row.table;
  return {
    id: row.id,
    restaurant_id: row.restaurant_id,
    table_id: row.table_id,
    items: (row.items ?? []) as OrderItemRow[],
    status: row.status,
    total: Number(row.total),
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    table: table as OrderWithTable["table"],
  };
}
