"use client";

import { useState, useTransition } from "react";
import { createOrderAction } from "@/app/carta/[slug]/actions";
import { useCartaCart } from "@/components/carta-publica/carta-cart-provider";
import { formatPriceBs } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CartaCartBar() {
  const { table, itemCount, formatSubtotal, setOpen } = useCartaCart();

  if (!table || itemCount === 0) return null;

  return (
    <div className="sticky bottom-0 z-30 border-t px-4 py-3 shadow-lg" style={{ backgroundColor: "var(--footer-bg)", borderColor: "var(--category-container-border)" }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-between rounded-xl px-4 text-sm font-semibold transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          backgroundColor: "var(--tab-active-bg)",
          color: "var(--tab-active-text)",
        }}
      >
        <span>Ver pedido ({itemCount})</span>
        <span>{formatSubtotal()}</span>
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
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
        aria-label="Cerrar pedido"
      />

      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl sm:rounded-2xl"
        style={{ backgroundColor: "var(--item-bg)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-panel-title"
      >
        <div
          className="flex items-center justify-between border-b px-4 py-4"
          style={{ borderColor: "var(--item-border)" }}
        >
          <h2 id="cart-panel-title" className="text-lg font-semibold" style={{ color: "var(--item-name-color)" }}>
            Tu pedido · {table.name}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg focus-visible:outline-none focus-visible:ring-2"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {success ? (
            <p className="rounded-lg px-3 py-4 text-center text-sm font-medium" style={{ backgroundColor: "var(--badge-featured-bg)", color: "var(--badge-featured-text)" }}>
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--item-name-color)" }}>
                      {line.name}
                    </p>
                    {line.variation_name ? (
                      <p className="text-xs" style={{ color: "var(--item-desc-color)" }}>
                        {line.variation_name}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm tabular-nums" style={{ color: "var(--item-price-color)" }}>
                      {formatPriceBs(line.unit_price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.key, line.quantity - 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm"
                      style={{ borderColor: "var(--item-border)" }}
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.key, line.quantity + 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm"
                      style={{ borderColor: "var(--item-border)" }}
                      aria-label="Agregar uno"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(line.key)}
                      className="ml-1 text-xs underline"
                      style={{ color: "var(--item-desc-color)" }}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!success ? (
          <div className="border-t px-4 py-4" style={{ borderColor: "var(--item-border)" }}>
            <label className="mb-2 block text-xs font-medium" style={{ color: "var(--item-desc-color)" }}>
              Notas para el local (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Sin cebolla, extra picante…"
              className="mb-3 w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
              style={{
                borderColor: "var(--item-border)",
                backgroundColor: "var(--body-bg)",
                color: "var(--item-name-color)",
              }}
            />

            {error ? (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mb-3 flex items-center justify-between text-sm font-semibold" style={{ color: "var(--item-name-color)" }}>
              <span>Total</span>
              <span style={{ color: "var(--item-price-color)" }}>{formatPriceBs(subtotal)}</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || items.length === 0}
              className={cn(
                "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition",
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
