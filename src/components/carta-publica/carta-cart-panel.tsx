"use client";

import { useEffect, useState, useTransition } from "react";
import { ShoppingBag } from "lucide-react";
import { createOrderAction } from "@/app/carta/[slug]/actions";
import { useCartaCart } from "@/components/carta-publica/carta-cart-provider";
import { CARTA_ORDER_PLACED_EVENT } from "@/lib/carta/order-wait-messages";
import { formatPriceBs } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Carrito flotante: visible al agregar ítems, sin scrollear hasta el final. */
export function CartaCartBar() {
  const { table, itemCount, formatSubtotal, isOpen, setOpen } = useCartaCart();

  if (!table || itemCount === 0 || isOpen) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-end p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "pointer-events-auto flex max-w-[min(100%,20rem)] items-center gap-3 rounded-full py-3 pl-4 pr-5",
          "text-sm font-semibold shadow-lg transition active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        )}
        style={{
          backgroundColor: "var(--tab-active-bg)",
          color: "var(--tab-active-text)",
          boxShadow:
            "0 12px 28px color-mix(in srgb, var(--tab-active-bg) 45%, transparent)",
        }}
        aria-label={`Ver pedido, ${itemCount} productos, total ${formatSubtotal()}`}
      >
        <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10">
          <ShoppingBag className="h-5 w-5" aria-hidden />
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none"
            style={{
              backgroundColor: "var(--body-bg)",
              color: "var(--tab-active-bg)",
            }}
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        </span>
        <span className="flex min-w-0 flex-col items-start text-left leading-tight">
          <span className="text-xs font-medium opacity-90">Ver pedido</span>
          <span className="truncate tabular-nums">{formatSubtotal()}</span>
        </span>
      </button>
    </div>
  );
}

export function CartaCartPanel() {
  const {
    table,
    items,
    subtotal,
    isOpen,
    setOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartaCart();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!table || !isOpen) return null;

  function handleSubmit() {
    if (!table || items.length === 0) return;

    setError(null);
    startTransition(() => {
      void (async () => {
        try {
          const result = await createOrderAction({
            restaurant_id: table.restaurant_id,
            table_id: table.id,
            items: items.map((line) => ({
              menu_item_id: line.menu_item_id,
              quantity: line.quantity,
              variation_id: line.variation_id ?? null,
            })),
            notes: notes.trim() || undefined,
          });

          if (!result) {
            setError(
              "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo."
            );
            return;
          }

          if (result.error) {
            setError(result.error);
            return;
          }

          clearCart();
          setNotes("");
          setSuccess(true);
          window.dispatchEvent(new Event(CARTA_ORDER_PLACED_EVENT));
          setTimeout(() => {
            setSuccess(false);
            setOpen(false);
          }, 2500);
        } catch {
          setError("No se pudo enviar el pedido. Intenta de nuevo.");
        }
      })();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center overflow-hidden overscroll-contain sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
        aria-label="Cerrar pedido"
      />

      <div
        className="relative z-10 flex max-h-[85vh] w-full min-w-0 max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
        style={{ backgroundColor: "var(--item-bg)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-panel-title"
      >
        <div
          className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-4"
          style={{ borderColor: "var(--item-border)" }}
        >
          <h2
            id="cart-panel-title"
            className="min-w-0 truncate text-lg font-semibold"
            style={{ color: "var(--item-name-color)" }}
          >
            Tu pedido · {table.name}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg focus-visible:outline-none focus-visible:ring-2"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-3">
          {success ? (
            <p
              className="rounded-lg px-3 py-4 text-center text-sm font-medium"
              style={{
                backgroundColor: "var(--badge-featured-bg)",
                color: "var(--badge-featured-text)",
              }}
            >
              ¡Pedido enviado! El local lo recibirá en breve.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((line) => (
                <li
                  key={line.key}
                  className="flex items-start justify-between gap-3 border-b pb-3"
                  style={{ borderColor: "var(--item-border)" }}
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{ color: "var(--item-name-color)" }}
                    >
                      {line.name}
                    </p>
                    {line.variation_name ? (
                      <p
                        className="truncate text-xs"
                        style={{ color: "var(--item-desc-color)" }}
                      >
                        {line.variation_name}
                      </p>
                    ) : null}
                    <p
                      className="mt-1 text-sm tabular-nums"
                      style={{ color: "var(--item-price-color)" }}
                    >
                      {formatPriceBs(line.unit_price)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(line.key, line.quantity - 1)
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm"
                      style={{ borderColor: "var(--item-border)" }}
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-medium tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(line.key, line.quantity + 1)
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm"
                      style={{ borderColor: "var(--item-border)" }}
                      aria-label="Agregar uno"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(line.key)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none"
                      style={{ color: "var(--item-desc-color)" }}
                      aria-label="Quitar del pedido"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!success ? (
          <div
            className="shrink-0 border-t px-4 py-4"
            style={{ borderColor: "var(--item-border)" }}
          >
            <label
              className="mb-2 block text-xs font-medium"
              style={{ color: "var(--item-desc-color)" }}
            >
              Notas para el local (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Sin cebolla, extra picante…"
              className="mb-3 box-border w-full max-w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
              style={{
                borderColor: "var(--item-border)",
                backgroundColor: "var(--body-bg)",
                color: "var(--item-name-color)",
              }}
            />

            {error ? (
              <p
                className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div
              className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold"
              style={{ color: "var(--item-name-color)" }}
            >
              <span>Total</span>
              <span
                className="shrink-0 tabular-nums"
                style={{ color: "var(--item-price-color)" }}
              >
                {formatPriceBs(subtotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || items.length === 0}
              className={cn(
                "flex h-12 w-full max-w-full items-center justify-center rounded-xl text-sm font-semibold transition",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              )}
              style={{
                backgroundColor: "var(--tab-active-bg)",
                color: "var(--tab-active-text)",
              }}
            >
              {isPending ? "Enviando…" : "Enviar pedido"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
