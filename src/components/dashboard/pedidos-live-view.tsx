"use client";

import { useTransition } from "react";
import { updateOrderStatusAction } from "@/app/carta/[slug]/actions";
import { useOrdersRealtime } from "@/hooks/use-orders-realtime";
import type { OrderRow, OrderWithTable } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/validations/order";
import { OrdersBoard } from "./orders-board";

import { NEXT_ORDER_STATUS } from "@/lib/validations/order";

function selectOrdersToDisplay(orders: OrderWithTable[]): OrderWithTable[] {
  const active = orders.filter(
    (o) =>
      o.status !== "delivered" &&
      o.status !== "cancelled" &&
      o.status !== "closed"
  );
  return active.length > 0 ? active : orders;
}

type PedidosLiveViewProps = {
  restaurantId: string;
  initialOrders: OrderWithTable[];
};

export function PedidosLiveView({
  restaurantId,
  initialOrders,
}: PedidosLiveViewProps) {
  const { orders, setOrders, isLive, status, lastError } = useOrdersRealtime(
    restaurantId,
    initialOrders
  );
  const [isPending, startTransition] = useTransition();

  const activeOrders = orders.filter(
    (o) =>
      o.status !== "delivered" &&
      o.status !== "cancelled" &&
      o.status !== "closed"
  );
  const displayOrders = selectOrdersToDisplay(orders);

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

  function cancelOrder(orderId: string) {
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
      }
    });
  }

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        <span>
          Activos: {activeOrders.length} · Total recientes: {orders.length}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
              aria-hidden
            />
            En vivo
          </span>
        ) : status === "polling" ? (
          <span className="text-amber-700">Actualizando cada 15 s</span>
        ) : status === "no-auth" ? (
          <span className="text-amber-700">Sin sesión (solo polling)</span>
        ) : (
          <span className="text-slate-400">Conectando…</span>
        )}
      </div>

      {process.env.NODE_ENV === "development" && (
        <p className="mt-1 font-mono text-xs text-slate-400">
          realtime: {status}
          {lastError ? ` · ${lastError}` : ""}
        </p>
      )}

      <div className="mt-6">
        <OrdersBoard
          orders={displayOrders}
          isPending={isPending}
          onAdvanceStatus={advanceStatus}
          onCancelOrder={cancelOrder}
        />
      </div>
    </>
  );
}
