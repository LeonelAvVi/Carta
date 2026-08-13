"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  clearTableAssistanceAction,
  closeTableOrdersAction,
  setTableDiscountAction,
  updateOrderStatusAction,
} from "@/app/carta/[slug]/actions";
import { useOrdersRealtime } from "@/hooks/use-orders-realtime";
import { createClient } from "@/lib/supabase/client";
import {
  buildTableBill,
  canCloseTableSession,
  getActiveOrdersForTable,
  getBillOrdersForTable,
  getCancelledOrdersForTable,
  getOccupiedTableIds,
  isActiveOrderStatus,
} from "@/lib/utils/staff-floor";
import type {
  OrderRow,
  OrderWithTable,
  RestaurantRow,
  TableRow,
} from "@/lib/types";
import { NEXT_ORDER_STATUS } from "@/lib/validations/order";
import { StaffFloorMap } from "./staff-floor-map";
import { StaffTableDetailPanel } from "./staff-table-detail-panel";

const TABLES_POLL_MS = 12_000;
const TABLE_SELECT =
  "id, restaurant_id, name, slug, is_active, assistance_kind, assistance_requested_at, discount_amount, discount_description, created_at, updated_at";

type StaffFloorLiveProps = {
  restaurant: RestaurantRow;
  initialTables: TableRow[];
  initialOrders: OrderWithTable[];
};

export function StaffFloorLive({
  restaurant,
  initialTables,
  initialOrders,
}: StaffFloorLiveProps) {
  const { orders, setOrders, isLive, status, lastError } = useOrdersRealtime(
    restaurant.id,
    initialOrders
  );
  const [tables, setTables] = useState(initialTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function normalizeTable(row: TableRow): TableRow {
      const amount = Number(row.discount_amount ?? 0);
      return {
        ...row,
        discount_amount: Number.isFinite(amount) ? amount : 0,
        discount_description: row.discount_description ?? null,
        assistance_kind:
          row.assistance_kind === "waiter" || row.assistance_kind === "bill"
            ? row.assistance_kind
            : null,
      };
    }

    async function refreshTables() {
      const { data, error } = await supabase
        .from("tables")
        .select(TABLE_SELECT)
        .eq("restaurant_id", restaurant.id)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("staff refreshTables:", error.message);
        return;
      }

      if (!data || data.length === 0) return;

      setTables((data as TableRow[]).map(normalizeTable));
    }

    void refreshTables();
    const id = window.setInterval(() => {
      void refreshTables();
    }, TABLES_POLL_MS);

    return () => window.clearInterval(id);
  }, [restaurant.id]);

  const occupiedTableIds = useMemo(() => getOccupiedTableIds(orders), [orders]);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId]
  );

  const selectedOrders = useMemo(
    () => (selectedTableId ? getActiveOrdersForTable(orders, selectedTableId) : []),
    [orders, selectedTableId]
  );

  const selectedBill = useMemo(() => {
    if (!selectedTableId) {
      return {
        lines: [],
        subtotal: 0,
        total: 0,
        discountAmount: 0,
        discountDescription: null,
        payable: 0,
        orderCount: 0,
      };
    }
    const table = tables.find((t) => t.id === selectedTableId);
    return buildTableBill(getBillOrdersForTable(orders, selectedTableId), {
      amount: table?.discount_amount,
      description: table?.discount_description,
    });
  }, [orders, selectedTableId, tables]);

  const selectedCancelledOrders = useMemo(
    () =>
      selectedTableId
        ? getCancelledOrdersForTable(orders, selectedTableId)
        : [],
    [orders, selectedTableId]
  );

  const closeGuard = useMemo(() => {
    if (!selectedTableId) return { ok: false as const, reason: "" };
    return canCloseTableSession(orders, selectedTableId);
  }, [orders, selectedTableId]);

  const activeOrderCount = useMemo(
    () => orders.filter((o) => isActiveOrderStatus(o.status)).length,
    [orders]
  );

  const assistanceCount = useMemo(
    () => tables.filter((t) => Boolean(t.assistance_kind)).length,
    [tables]
  );

  function advanceStatus(orderId: string, current: OrderRow["status"]) {
    const next = NEXT_ORDER_STATUS[current];
    if (!next) return;

    setActionError(null);
    startTransition(async () => {
      const previous = orders.find((o) => o.id === orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: next } : o))
      );

      const result = await updateOrderStatusAction(orderId, next);
      if (result?.error && previous) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? previous : o))
        );
        setActionError(result.error);
      }
    });
  }

  function cancelOrder(orderId: string) {
    setActionError(null);
    startTransition(async () => {
      const previous = orders.find((o) => o.id === orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "cancelled" as const } : o
        )
      );

      const result = await updateOrderStatusAction(orderId, "cancelled");
      if (result?.error && previous) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? previous : o))
        );
        setActionError(result.error);
      }
    });
  }

  function closeTable(tableId: string) {
    const guard = canCloseTableSession(orders, tableId);
    if (!guard.ok) {
      setActionError(guard.reason);
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const snapshot = orders;
      const tablesSnapshot = tables;
      setOrders((prev) =>
        prev.map((o) =>
          o.table_id === tableId &&
          (o.status === "delivered" || o.status === "cancelled")
            ? { ...o, status: "closed" as const }
            : o
        )
      );
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                assistance_kind: null,
                assistance_requested_at: null,
                discount_amount: 0,
                discount_description: null,
              }
            : t
        )
      );

      const result = await closeTableOrdersAction(tableId);
      if (result?.error) {
        setOrders(snapshot);
        setTables(tablesSnapshot);
        setActionError(result.error);
        return;
      }

      setSelectedTableId(null);
    });
  }

  function clearAssistance(tableId: string) {
    setActionError(null);
    startTransition(async () => {
      const previous = tables.find((t) => t.id === tableId);
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? { ...t, assistance_kind: null, assistance_requested_at: null }
            : t
        )
      );

      const result = await clearTableAssistanceAction(tableId);
      if (result?.error && previous) {
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? previous : t))
        );
        setActionError(result.error);
      }
    });
  }

  function saveDiscount(tableId: string, amount: number, description: string) {
    setActionError(null);
    startTransition(async () => {
      const previous = tables.find((t) => t.id === tableId);
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                discount_amount: amount,
                discount_description: amount > 0 ? description : null,
              }
            : t
        )
      );

      const result = await setTableDiscountAction(tableId, amount, description);
      if (result?.error) {
        if (previous) {
          setTables((prev) =>
            prev.map((t) => (t.id === tableId ? previous : t))
          );
        }
        setActionError(result.error);
        return;
      }

      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                discount_amount: result.amount ?? 0,
                discount_description: result.description ?? null,
              }
            : t
        )
      );
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-4 border-b border-slate-700/50 pb-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-amber-400/90">
            Vista de mostrador
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{restaurant.name}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {tables.length} mesas · {activeOrderCount} pedidos activos
            {assistanceCount > 0
              ? ` · ${assistanceCount} llamado${assistanceCount === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 text-sm">
          {isLive ? (
            <span className="inline-flex items-center gap-2 text-emerald-400">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              En vivo
            </span>
          ) : status === "polling" ? (
            <span className="text-amber-300">Actualizando cada 15 s</span>
          ) : (
            <span className="text-slate-500">Conectando Realtime…</span>
          )}
          {process.env.NODE_ENV === "development" && (
            <span className="font-mono text-xs text-slate-600">
              {status}
              {lastError ? ` · ${lastError}` : ""}
            </span>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-6 overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <StaffFloorMap
            tables={tables}
            occupiedTableIds={occupiedTableIds}
            selectedTableId={selectedTableId}
            onSelectTable={setSelectedTableId}
          />
        </div>

        <StaffTableDetailPanel
          table={selectedTable}
          orders={selectedOrders}
          bill={selectedBill}
          cancelledOrders={selectedCancelledOrders}
          canClose={closeGuard.ok}
          closeBlockedReason={closeGuard.ok ? null : closeGuard.reason}
          isPending={isPending}
          actionError={actionError}
          onAdvanceStatus={advanceStatus}
          onCancelOrder={cancelOrder}
          onCloseTable={closeTable}
          onClearAssistance={clearAssistance}
          onSaveDiscount={saveDiscount}
          onClose={() => {
            setActionError(null);
            setSelectedTableId(null);
          }}
        />
      </div>
    </div>
  );
}
