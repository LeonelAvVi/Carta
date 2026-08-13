"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getGuestTableOrderStatusAction,
  type GuestBillOrder,
} from "@/app/carta/[slug]/actions";
import { useCartaCart } from "@/components/carta-publica/carta-cart-provider";
import {
  CARTA_ORDER_PLACED_EVENT,
  ORDER_MESSAGE_ROTATE_MS,
  ORDER_STATUS_POLL_MS,
  ORDER_WAIT_MESSAGES,
  ORDER_WAIT_STATUS_LABELS,
  isGuestWaitStatus,
  type GuestWaitStatus,
} from "@/lib/carta/order-wait-messages";
import { cn, formatDateTime, formatPriceBs } from "@/lib/utils";

export function CartaTableBanner() {
  const { table } = useCartaCart();
  const [status, setStatus] = useState<GuestWaitStatus | null>(null);
  const [billTotal, setBillTotal] = useState(0);
  const [billSubtotal, setBillSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountDescription, setDiscountDescription] = useState<string | null>(
    null
  );
  const [orderCount, setOrderCount] = useState(0);
  const [billOrders, setBillOrders] = useState<GuestBillOrder[]>([]);
  const [billOpen, setBillOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const refreshStatus = useCallback(async () => {
    if (!table) return;

    const result = await getGuestTableOrderStatusAction(
      table.restaurant_id,
      table.id
    );

    if (result.error) return;

    const nextStatus = result.status;
    if (isGuestWaitStatus(nextStatus)) {
      setStatus(nextStatus);
    } else {
      setStatus(null);
    }

    const nextSubtotal =
      typeof result.bill_subtotal === "number" && result.bill_subtotal > 0
        ? result.bill_subtotal
        : typeof result.bill_total === "number" && result.bill_total > 0
          ? result.bill_total
          : 0;
    const nextDiscount =
      typeof result.discount_amount === "number" && result.discount_amount > 0
        ? result.discount_amount
        : 0;
    const nextTotal =
      typeof result.bill_total === "number" && result.bill_total >= 0
        ? result.bill_total
        : Math.max(0, nextSubtotal - nextDiscount);
    const nextCount =
      typeof result.order_count === "number" && result.order_count > 0
        ? result.order_count
        : 0;
    const nextOrders = result.orders ?? [];

    setBillSubtotal(nextSubtotal);
    setDiscountAmount(nextDiscount);
    setDiscountDescription(result.discount_description ?? null);
    setBillTotal(nextTotal);
    setOrderCount(nextCount);
    setBillOrders(nextOrders);

    if (nextSubtotal <= 0 && nextTotal <= 0) {
      setBillOpen(false);
    }
  }, [table]);

  useEffect(() => {
    if (!table) {
      setStatus(null);
      setBillTotal(0);
      setBillSubtotal(0);
      setDiscountAmount(0);
      setDiscountDescription(null);
      setOrderCount(0);
      setBillOrders([]);
      setBillOpen(false);
      return;
    }

    void refreshStatus();
    const poll = window.setInterval(() => {
      void refreshStatus();
    }, ORDER_STATUS_POLL_MS);

    const onOrderPlaced = () => {
      setStatus("pending");
      void refreshStatus();
    };
    window.addEventListener(CARTA_ORDER_PLACED_EVENT, onOrderPlaced);

    return () => {
      window.clearInterval(poll);
      window.removeEventListener(CARTA_ORDER_PLACED_EVENT, onOrderPlaced);
    };
  }, [table, refreshStatus]);

  useEffect(() => {
    setMessageIndex(0);
    setFade(true);
  }, [status]);

  useEffect(() => {
    if (!status) return;

    const messages = ORDER_WAIT_MESSAGES[status];
    let fadeTimeout: number | undefined;
    const rotate = window.setInterval(() => {
      setFade(false);
      fadeTimeout = window.setTimeout(() => {
        setMessageIndex((i) => (i + 1) % messages.length);
        setFade(true);
      }, 220);
    }, ORDER_MESSAGE_ROTATE_MS);

    return () => {
      window.clearInterval(rotate);
      if (fadeTimeout !== undefined) window.clearTimeout(fadeTimeout);
    };
  }, [status]);

  useEffect(() => {
    if (!billOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [billOpen]);

  if (!table) return null;

  const isDelivery = table.slug === "delivery";
  const hasBill = billSubtotal > 0 || billTotal > 0;
  const messages = status ? ORDER_WAIT_MESSAGES[status] : null;
  const message = messages ? messages[messageIndex % messages.length] : null;

  const spacerClass = cn(
    "shrink-0",
    hasBill && message
      ? "h-[6.75rem]"
      : hasBill || message
        ? "h-[5.5rem]"
        : "h-[3.75rem]"
  );

  return (
    <>
      <div className={spacerClass} aria-hidden />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center overflow-x-hidden px-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
        role="status"
      >
        <div
          className="pointer-events-auto w-full min-w-0 max-w-lg rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-md"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--body-bg) 88%, var(--tab-active-bg))",
            color: "var(--item-name-color)",
            borderColor: "var(--category-container-border)",
            boxShadow:
              "0 10px 30px color-mix(in srgb, var(--item-name-color) 12%, transparent)",
          }}
        >
          <div className="flex items-start justify-between gap-3 text-left">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {isDelivery ? (
                  <>
                    Pedido <span className="font-bold">Delivery</span>
                  </>
                ) : (
                  <>
                    Mesa <span className="font-bold">{table.name}</span>
                  </>
                )}
                {status ? (
                  <span className="ml-1.5 text-xs font-semibold opacity-70">
                    · {ORDER_WAIT_STATUS_LABELS[status]}
                  </span>
                ) : null}
              </p>

              {message ? (
                <p
                  className={cn(
                    "mt-1 text-sm leading-snug transition-opacity duration-200",
                    fade ? "opacity-100" : "opacity-0"
                  )}
                  aria-live="polite"
                >
                  {message}
                </p>
              ) : null}
            </div>

            {hasBill ? (
              <button
                type="button"
                onClick={() => setBillOpen(true)}
                className="shrink-0 rounded-xl px-3 py-1.5 text-right transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--tab-active-bg) 16%, transparent)",
                }}
                aria-label={`Ver cuenta, ${orderCount} pedidos, total ${formatPriceBs(billTotal)}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                  Tu cuenta
                </p>
                <p
                  className="text-base font-bold tabular-nums leading-tight"
                  style={{ color: "var(--tab-active-bg)" }}
                >
                  {formatPriceBs(billTotal)}
                </p>
                {discountAmount > 0 ? (
                  <p className="mt-0.5 text-[10px] font-medium opacity-70">
                    Desc. −{formatPriceBs(discountAmount)}
                  </p>
                ) : null}
                {orderCount > 0 ? (
                  <p className="mt-0.5 text-[10px] opacity-60 underline-offset-2">
                    {orderCount} pedido{orderCount === 1 ? "" : "s"} · ver
                  </p>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {billOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setBillOpen(false)}
            aria-label="Cerrar cuenta"
          />
          <div
            className="relative z-10 flex max-h-[80vh] w-full min-w-0 max-w-lg flex-col overflow-hidden rounded-t-2xl border shadow-xl sm:rounded-2xl"
            style={{
              backgroundColor: "var(--item-bg)",
              borderColor: "var(--item-border)",
              color: "var(--item-name-color)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-bill-title"
          >
            <div
              className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-4"
              style={{ borderColor: "var(--item-border)" }}
            >
              <div>
                <h2
                  id="guest-bill-title"
                  className="text-lg font-semibold"
                >
                  Tu cuenta
                </h2>
                <p className="mt-0.5 text-xs opacity-70">
                  Pedidos entregados en esta mesa
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBillOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg focus-visible:outline-none focus-visible:ring-2"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              {billOrders.length === 0 ? (
                <p className="py-8 text-center text-sm opacity-60">
                  Todavía no hay pedidos entregados.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {billOrders.map((order, index) => (
                    <li
                      key={order.id}
                      className="rounded-xl border px-3 py-3"
                      style={{ borderColor: "var(--item-border)" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          Pedido {index + 1}
                        </p>
                        <p className="text-xs opacity-60">
                          {formatDateTime(order.created_at)}
                        </p>
                      </div>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {order.items.map((line, lineIndex) => (
                          <li
                            key={`${order.id}-${lineIndex}`}
                            className="flex justify-between gap-2 text-sm"
                          >
                            <span className="min-w-0 opacity-90">
                              {line.quantity}× {line.name}
                              {line.variation_name
                                ? ` (${line.variation_name})`
                                : ""}
                            </span>
                            <span
                              className="shrink-0 tabular-nums"
                              style={{ color: "var(--item-price-color)" }}
                            >
                              {formatPriceBs(line.line_total)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-right text-sm font-bold tabular-nums">
                        Subtotal {formatPriceBs(order.total)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {discountAmount > 0 ? (
                <div
                  className="mt-3 rounded-xl border px-3 py-3"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--tab-active-bg) 35%, var(--item-border))",
                    backgroundColor:
                      "color-mix(in srgb, var(--tab-active-bg) 10%, transparent)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--tab-active-bg)" }}
                  >
                    Descuento aplicado
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs opacity-70">Monto</p>
                      <p
                        className="text-base font-bold tabular-nums"
                        style={{ color: "var(--tab-active-bg)" }}
                      >
                        −{formatPriceBs(discountAmount)}
                      </p>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-t pt-2" style={{ borderColor: "var(--item-border)" }}>
                      <p className="text-xs opacity-70">Descripción</p>
                      <p className="max-w-[65%] text-right text-sm font-medium leading-snug">
                        {discountDescription?.trim()
                          ? discountDescription
                          : "Sin descripción"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="shrink-0 border-t px-4 py-4"
              style={{ borderColor: "var(--item-border)" }}
            >
              <div className="flex items-center justify-between gap-3 text-sm opacity-80">
                <p>Subtotal</p>
                <p className="tabular-nums">{formatPriceBs(billSubtotal)}</p>
              </div>
              {discountAmount > 0 ? (
                <div className="mt-1.5 flex items-center justify-between gap-3 text-sm opacity-80">
                  <p>Descuento</p>
                  <p className="tabular-nums">
                    −{formatPriceBs(discountAmount)}
                  </p>
                </div>
              ) : null}
              <div
                className="mt-3 flex items-center justify-between gap-3 border-t pt-3"
                style={{ borderColor: "var(--item-border)" }}
              >
                <p className="text-sm font-medium opacity-80">Total</p>
                <p
                  className="text-xl font-bold tabular-nums"
                  style={{ color: "var(--tab-active-bg)" }}
                >
                  {formatPriceBs(billTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
