"use client";

import { ORDER_STATUS_LABELS, NEXT_ORDER_STATUS } from "@/lib/validations/order";
import type { OrderRow, OrderWithTable, TableRow } from "@/lib/types";
import { formatDateTime, formatPriceBs } from "@/lib/utils";

type StaffTableDetailPanelProps = {
  table: TableRow | null;
  orders: OrderWithTable[];
  isPending?: boolean;
  onAdvanceStatus: (orderId: string, current: OrderRow["status"]) => void;
  onClose: () => void;
};

export function StaffTableDetailPanel({
  table,
  orders,
  isPending = false,
  onAdvanceStatus,
  onClose,
}: StaffTableDetailPanelProps) {
  if (!table) {
    return (
      <aside className="hidden w-96 shrink-0 flex-col rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 lg:flex">
        <p className="text-sm text-slate-500">
          Seleccioná una mesa del mapa para ver sus pedidos activos.
        </p>
      </aside>
    );
  }

  return (
    <>
      <aside className="hidden w-96 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-xl lg:flex">
        <PanelContent
          table={table}
          orders={orders}
          isPending={isPending}
          onAdvanceStatus={onAdvanceStatus}
          onClose={onClose}
        />
      </aside>

      <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/50 lg:hidden">
        <button
          type="button"
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Cerrar panel"
        />
        <div className="relative z-10 flex w-full max-w-md flex-col bg-slate-900 shadow-2xl">
          <PanelContent
            table={table}
            orders={orders}
            isPending={isPending}
            onAdvanceStatus={onAdvanceStatus}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}

function PanelContent({
  table,
  orders,
  isPending,
  onAdvanceStatus,
  onClose,
}: {
  table: TableRow;
  orders: OrderWithTable[];
  isPending: boolean;
  onAdvanceStatus: (orderId: string, current: OrderRow["status"]) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400/80">
            Mesa seleccionada
          </p>
          <h3 className="mt-1 text-2xl font-bold text-white">{table.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {orders.length === 0
              ? "Sin pedidos activos"
              : `${orders.length} pedido${orders.length === 1 ? "" : "s"} activo${orders.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">
            Esta mesa está libre o no tiene pedidos pendientes.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {orders.map((order) => {
              const next = NEXT_ORDER_STATUS[order.status];

              return (
                <li
                  key={order.id}
                  className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDateTime(order.created_at)}
                    </span>
                  </div>

                  <ul className="mt-3 flex flex-col gap-2">
                    {order.items.map((line, index) => (
                      <li
                        key={`${line.menu_item_id}-${index}`}
                        className="flex justify-between gap-2 text-sm"
                      >
                        <span className="text-slate-300">
                          {line.quantity}× {line.name}
                          {line.variation_name ? ` (${line.variation_name})` : ""}
                        </span>
                        <span className="shrink-0 tabular-nums text-slate-200">
                          {formatPriceBs(line.line_total)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.notes ? (
                    <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200/90">
                      Nota: {order.notes}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">
                      Total: {formatPriceBs(order.total)}
                    </p>
                    {next ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onAdvanceStatus(order.id, order.status)}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-amber-500 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
                      >
                        Marcar como {ORDER_STATUS_LABELS[next]}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
