"use client";

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  NEXT_ORDER_STATUS,
} from "@/lib/validations/order";
import type { OrderRow, OrderWithTable } from "@/lib/types";
import { formatPriceBs, formatDateTime, cn } from "@/lib/utils";

type OrdersBoardProps = {
  orders: OrderWithTable[];
  isPending?: boolean;
  onAdvanceStatus: (orderId: string, current: OrderRow["status"]) => void;
  onCancelOrder?: (orderId: string) => void;
};

export function OrdersBoard({
  orders,
  isPending = false,
  onAdvanceStatus,
  onCancelOrder,
}: OrdersBoardProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">No hay pedidos todavía.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => {
        const next = NEXT_ORDER_STATUS[order.status];
        const canCancel =
          order.status !== "delivered" &&
          order.status !== "cancelled" &&
          order.status !== "closed";
        const statusStyle = ORDER_STATUS_STYLES[order.status];
        const nextStyle = next ? ORDER_STATUS_STYLES[next] : null;

        return (
          <li
            key={order.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {order.table.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(order.created_at)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  statusStyle.badge
                )}
              >
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
              {order.items.map((line, index) => (
                <li
                  key={`${line.menu_item_id}-${index}`}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="text-slate-700">
                    {line.quantity}× {line.name}
                    {line.variation_name ? ` (${line.variation_name})` : ""}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-slate-900">
                    {formatPriceBs(line.line_total)}
                  </span>
                </li>
              ))}
            </ul>

            {order.notes ? (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Nota: {order.notes}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-base font-bold text-slate-900">
                Total: {formatPriceBs(order.total)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {canCancel && onCancelOrder ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onCancelOrder(order.id)}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
                    )}
                  >
                    Cancelar pedido
                  </button>
                ) : null}
                {next && nextStyle ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onAdvanceStatus(order.id, order.status)}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-60",
                      nextStyle.button
                    )}
                  >
                    Marcar como {ORDER_STATUS_LABELS[next]}
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
