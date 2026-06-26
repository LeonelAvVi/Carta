"use client";

import { ORDER_STATUS_LABELS, NEXT_ORDER_STATUS } from "@/lib/validations/order";
import type { OrderRow, OrderWithTable } from "@/lib/types";
import { formatPriceBs, formatDateTime } from "@/lib/utils";

type OrdersBoardProps = {
  orders: OrderWithTable[];
  isPending?: boolean;
  onAdvanceStatus: (orderId: string, current: OrderRow["status"]) => void;
};

const NEXT_STATUS = NEXT_ORDER_STATUS;

export function OrdersBoard({
  orders,
  isPending = false,
  onAdvanceStatus,
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
        const next = NEXT_STATUS[order.status];

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
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
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
              {next ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => onAdvanceStatus(order.id, order.status)}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  Marcar como {ORDER_STATUS_LABELS[next]}
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
