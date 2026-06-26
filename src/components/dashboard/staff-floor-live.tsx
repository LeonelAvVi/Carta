"use client";

import { useMemo, useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/app/carta/[slug]/actions";
import { useOrdersRealtime } from "@/hooks/use-orders-realtime";
import {
  getActiveOrdersForTable,
  getOccupiedTableIds,
} from "@/lib/utils/staff-floor";
import type { OrderRow, OrderWithTable, RestaurantRow, TableRow } from "@/lib/types";
import { NEXT_ORDER_STATUS } from "@/lib/validations/order";
import { StaffFloorMap } from "./staff-floor-map";
import { StaffTableDetailPanel } from "./staff-table-detail-panel";

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
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const occupiedTableIds = useMemo(() => getOccupiedTableIds(orders), [orders]);

  const selectedTable = useMemo(
    () => initialTables.find((table) => table.id === selectedTableId) ?? null,
    [initialTables, selectedTableId]
  );

  const selectedOrders = useMemo(
    () => (selectedTableId ? getActiveOrdersForTable(orders, selectedTableId) : []),
    [orders, selectedTableId]
  );

  const activeOrderCount = useMemo(
    () => orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
    [orders]
  );

  function advanceStatus(orderId: string, current: OrderRow["status"]) {
    const next = NEXT_ORDER_STATUS[current];
    if (!next) return;

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
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-700/50 pb-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-amber-400/90">
            Vista de mostrador
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{restaurant.name}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {initialTables.length} mesas · {activeOrderCount} pedidos activos
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

      <div className="flex flex-1 gap-6">
        <StaffFloorMap
          tables={initialTables}
          occupiedTableIds={occupiedTableIds}
          selectedTableId={selectedTableId}
          onSelectTable={setSelectedTableId}
        />

        <StaffTableDetailPanel
          table={selectedTable}
          orders={selectedOrders}
          isPending={isPending}
          onAdvanceStatus={advanceStatus}
          onClose={() => setSelectedTableId(null)}
        />
      </div>
    </div>
  );
}
