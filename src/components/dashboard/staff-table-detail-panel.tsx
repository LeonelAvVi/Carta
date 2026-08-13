"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  NEXT_ORDER_STATUS,
} from "@/lib/validations/order";
import type { OrderRow, OrderWithTable, TableRow } from "@/lib/types";
import type { TableBill } from "@/lib/utils/staff-floor";
import { cn, formatDateTime, formatPriceBs } from "@/lib/utils";

type StaffPanelTab = "pedidos" | "cuenta";

type StaffTableDetailPanelProps = {
  table: TableRow | null;
  orders: OrderWithTable[];
  bill: TableBill;
  cancelledOrders?: OrderWithTable[];
  canClose?: boolean;
  closeBlockedReason?: string | null;
  isPending?: boolean;
  actionError?: string | null;
  onAdvanceStatus: (orderId: string, current: OrderRow["status"]) => void;
  onCancelOrder?: (orderId: string) => void;
  onCloseTable?: (tableId: string) => void;
  onClearAssistance?: (tableId: string) => void;
  onSaveDiscount?: (
    tableId: string,
    amount: number,
    description: string
  ) => void;
  onClose: () => void;
};

export function StaffTableDetailPanel({
  table,
  orders,
  bill,
  cancelledOrders = [],
  canClose = false,
  closeBlockedReason = null,
  isPending = false,
  actionError = null,
  onAdvanceStatus,
  onCancelOrder,
  onCloseTable,
  onClearAssistance,
  onSaveDiscount,
  onClose,
}: StaffTableDetailPanelProps) {
  if (!table) {
    return (
      <aside className="hidden h-full min-h-0 w-96 shrink-0 flex-col overflow-y-auto overscroll-contain rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 lg:flex">
        <p className="text-sm text-slate-500">
          Seleccioná una mesa del mapa para ver sus pedidos y la cuenta.
        </p>
      </aside>
    );
  }

  return (
    <>
      <aside className="hidden h-full min-h-0 w-96 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-xl lg:flex">
        <PanelContent
          table={table}
          orders={orders}
          bill={bill}
          cancelledOrders={cancelledOrders}
          canClose={canClose}
          closeBlockedReason={closeBlockedReason}
          isPending={isPending}
          actionError={actionError}
          onAdvanceStatus={onAdvanceStatus}
          onCancelOrder={onCancelOrder}
          onCloseTable={onCloseTable}
          onClearAssistance={onClearAssistance}
          onSaveDiscount={onSaveDiscount}
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
        <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-hidden bg-slate-900 shadow-2xl">
          <PanelContent
            table={table}
            orders={orders}
            bill={bill}
            cancelledOrders={cancelledOrders}
            canClose={canClose}
            closeBlockedReason={closeBlockedReason}
            isPending={isPending}
            actionError={actionError}
            onAdvanceStatus={onAdvanceStatus}
            onCancelOrder={onCancelOrder}
            onCloseTable={onCloseTable}
            onClearAssistance={onClearAssistance}
            onSaveDiscount={onSaveDiscount}
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
  bill,
  cancelledOrders,
  canClose,
  closeBlockedReason,
  isPending,
  actionError,
  onAdvanceStatus,
  onCancelOrder,
  onCloseTable,
  onClearAssistance,
  onSaveDiscount,
  onClose,
}: {
  table: TableRow;
  orders: OrderWithTable[];
  bill: TableBill;
  cancelledOrders: OrderWithTable[];
  canClose: boolean;
  closeBlockedReason: string | null;
  isPending: boolean;
  actionError: string | null;
  onAdvanceStatus: (orderId: string, current: OrderRow["status"]) => void;
  onCancelOrder?: (orderId: string) => void;
  onCloseTable?: (tableId: string) => void;
  onClearAssistance?: (tableId: string) => void;
  onSaveDiscount?: (
    tableId: string,
    amount: number,
    description: string
  ) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<StaffPanelTab>("pedidos");

  useEffect(() => {
    setTab("pedidos");
  }, [table.id]);

  const showCloseSection =
    Boolean(onCloseTable) &&
    (bill.orderCount > 0 || orders.length > 0 || cancelledOrders.length > 0);

  const tabs = useMemo(
    () =>
      [
        { id: "pedidos" as const, label: "Pedidos", count: orders.length },
        {
          id: "cuenta" as const,
          label: "Cuenta",
          count: bill.lines.length + cancelledOrders.length,
        },
      ] as const,
    [orders.length, bill.lines.length, cancelledOrders.length]
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-700/60 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400/80">
            Mesa seleccionada
          </p>
          <h3 className="mt-1 text-2xl font-bold text-white">{table.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {orders.length === 0
              ? "Sin pedidos activos"
              : `${orders.length} pedido${orders.length === 1 ? "" : "s"} activo${orders.length === 1 ? "" : "s"}`}
            {bill.payable > 0
              ? ` · Cuenta ${formatPriceBs(bill.payable)}`
              : bill.subtotal > 0
                ? ` · Cuenta ${formatPriceBs(bill.subtotal)}`
                : ""}
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

      {table.assistance_kind ? (
        <div className="shrink-0 border-b border-sky-500/30 bg-sky-500/10 px-5 py-3">
          <p className="text-sm font-semibold text-sky-200">
            {table.assistance_kind === "bill"
              ? "La mesa pide la cuenta"
              : "La mesa llama a un mesero"}
          </p>
          {onClearAssistance ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => onClearAssistance(table.id)}
              className="mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-sky-400 px-3 text-xs font-semibold text-slate-950 hover:bg-sky-300 disabled:opacity-60"
            >
              Marcar atendido
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="shrink-0 border-b border-slate-700/60 px-5 pt-3">
        <div className="flex gap-1" role="tablist" aria-label="Vista de mesa">
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative flex-1 rounded-t-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active
                      ? "bg-amber-400/20 text-amber-300"
                      : "bg-slate-700 text-slate-400"
                  )}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          {tab === "pedidos" ? (
            <ActiveOrdersList
              orders={orders}
              isPending={isPending}
              onAdvanceStatus={onAdvanceStatus}
              onCancelOrder={onCancelOrder}
            />
          ) : (
            <TableBillView
              bill={bill}
              cancelledOrders={cancelledOrders}
              tableId={table.id}
              isPending={isPending}
              onSaveDiscount={onSaveDiscount}
            />
          )}
        </div>

        {showCloseSection && onCloseTable ? (
          <div className="shrink-0 border-t border-slate-700/60 p-5">
            {actionError ? (
              <p
                className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
                role="alert"
              >
                {actionError}
              </p>
            ) : null}
            {!canClose && closeBlockedReason ? (
              <p
                className="mb-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100"
                role="status"
              >
                {closeBlockedReason}
              </p>
            ) : null}
            <button
              type="button"
              disabled={isPending || !canClose}
              onClick={() => {
                if (!canClose) return;
                if (
                  window.confirm(
                    "¿Cerrar la mesa? Se cobrará solo lo entregado, se liberará para otros comensales y la cuenta quedará en cero."
                  )
                ) {
                  onCloseTable(table.id);
                }
              }}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Cerrando…" : "Cerrar mesa · dejar libre"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              Con todo entregado o todo cancelado (si el cliente se fue)
            </p>
          </div>
        ) : actionError ? (
          <div className="shrink-0 border-t border-slate-700/60 p-5">
            <p
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
              role="alert"
            >
              {actionError}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActiveOrdersList({
  orders,
  isPending,
  onAdvanceStatus,
  onCancelOrder,
}: {
  orders: OrderWithTable[];
  isPending: boolean;
  onAdvanceStatus: (orderId: string, current: OrderRow["status"]) => void;
  onCancelOrder?: (orderId: string) => void;
}) {
  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">
        Esta mesa está libre o no tiene pedidos pendientes. Revisá la pestaña
        Cuenta para ver lo ya entregado.
      </p>
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
            className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  statusStyle.badge
                )}
              >
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

            <div className="mt-3 flex flex-col gap-2">
              <p className="text-sm font-bold text-white">
                Total: {formatPriceBs(order.total)}
              </p>
              <div className="flex flex-wrap gap-2">
                {canCancel && onCancelOrder ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onCancelOrder(order.id)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-400/40 bg-transparent px-3 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                ) : null}
                {next && nextStyle ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onAdvanceStatus(order.id, order.status)}
                    className={cn(
                      "inline-flex h-9 flex-1 items-center justify-center rounded-lg px-3 text-xs font-semibold disabled:opacity-60",
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

function TableBillView({
  bill,
  cancelledOrders,
  tableId,
  isPending,
  onSaveDiscount,
}: {
  bill: TableBill;
  cancelledOrders: OrderWithTable[];
  tableId: string;
  isPending: boolean;
  onSaveDiscount?: (
    tableId: string,
    amount: number,
    description: string
  ) => void;
}) {
  const [discountAmount, setDiscountAmount] = useState(
    bill.discountAmount > 0 ? String(bill.discountAmount) : ""
  );
  const [discountDescription, setDiscountDescription] = useState(
    bill.discountDescription ?? ""
  );

  useEffect(() => {
    setDiscountAmount(
      bill.discountAmount > 0 ? String(bill.discountAmount) : ""
    );
    setDiscountDescription(bill.discountDescription ?? "");
  }, [tableId, bill.discountAmount, bill.discountDescription]);

  if (bill.lines.length === 0 && cancelledOrders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">
        Todavía no hay pedidos entregados en esta mesa.
      </p>
    );
  }

  function handleSaveDiscount() {
    if (!onSaveDiscount) return;
    const amount = Number(discountAmount.replace(",", "."));
    onSaveDiscount(
      tableId,
      Number.isFinite(amount) && amount > 0 ? amount : 0,
      discountDescription.trim()
    );
  }

  function handleClearDiscount() {
    if (!onSaveDiscount) return;
    setDiscountAmount("");
    setDiscountDescription("");
    onSaveDiscount(tableId, 0, "");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-300/80">
          Cuenta de la mesa
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Solo pedidos entregados
          {bill.orderCount > 0
            ? ` (${bill.orderCount} pedido${bill.orderCount === 1 ? "" : "s"})`
            : ""}
          . Los cancelados no suman.
        </p>
      </div>

      {bill.lines.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {bill.lines.map((line) => (
            <li
              key={line.key}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100">{line.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {line.quantity} unidad{line.quantity === 1 ? "" : "es"}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-white">
                {formatPriceBs(line.line_total)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          Aún no hay ítems entregados para cobrar.
        </p>
      )}

      {cancelledOrders.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-300/80">
            Cancelados (no cobran)
          </p>
          <ul className="flex flex-col gap-2">
            {cancelledOrders.map((order) => (
              <li
                key={order.id}
                className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2.5 opacity-80"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-200">
                    Cancelado
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDateTime(order.created_at)}
                  </span>
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {order.items.map((line, index) => (
                    <li
                      key={`${order.id}-${line.menu_item_id}-${index}`}
                      className="flex justify-between gap-2 text-sm text-slate-400 line-through"
                    >
                      <span>
                        {line.quantity}× {line.name}
                        {line.variation_name
                          ? ` (${line.variation_name})`
                          : ""}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {formatPriceBs(line.line_total)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {onSaveDiscount && bill.subtotal > 0 ? (
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Descuento
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">
                Monto (Bs.)
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="0"
                className="h-10 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">
                Descripción
              </span>
              <input
                type="text"
                value={discountDescription}
                onChange={(e) => setDiscountDescription(e.target.value)}
                placeholder="Ej. promoción, cortesía…"
                maxLength={120}
                className="h-10 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveDiscount}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-amber-400 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60"
              >
                Guardar descuento
              </button>
              {bill.discountAmount > 0 ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleClearDiscount}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-600 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-60"
                >
                  Quitar
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-0 rounded-xl border border-amber-400/30 bg-slate-950/95 px-4 py-4 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatPriceBs(bill.subtotal)}</span>
        </div>
        {bill.discountAmount > 0 ? (
          <div className="mt-1.5 flex items-center justify-between gap-3 text-sm text-emerald-300/90">
            <span className="min-w-0 truncate">
              Descuento
              {bill.discountDescription
                ? ` · ${bill.discountDescription}`
                : ""}
            </span>
            <span className="shrink-0 tabular-nums">
              −{formatPriceBs(bill.discountAmount)}
            </span>
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-700/60 pt-3">
          <p className="text-sm font-medium text-slate-300">Total a cobrar</p>
          <p className="text-2xl font-bold tabular-nums text-amber-300">
            {formatPriceBs(bill.payable)}
          </p>
        </div>
      </div>
    </div>
  );
}
