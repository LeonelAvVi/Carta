"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Bell, Receipt } from "lucide-react";
import {
  getTableAssistanceAction,
  requestTableAssistanceAction,
} from "@/app/carta/[slug]/actions";
import { useCartaCart } from "@/components/carta-publica/carta-cart-provider";
import type { TableAssistanceKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLL_MS = 15_000;

const KIND_LABELS: Record<TableAssistanceKind, string> = {
  waiter: "Mesero en camino",
  bill: "Cuenta solicitada",
};

/** Botón flotante: llamar mesero o pedir la cuenta. */
export function CartaAssistanceButton() {
  const { table, isOpen: cartOpen } = useCartaCart();
  const [panelOpen, setPanelOpen] = useState(false);
  const [kind, setKind] = useState<TableAssistanceKind | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    if (!table) return;
    const result = await getTableAssistanceAction(
      table.restaurant_id,
      table.id
    );
    if (result.error) return;
    setKind(result.kind ?? null);
  }, [table]);

  useEffect(() => {
    if (!table) {
      setKind(null);
      return;
    }

    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [table, refresh]);

  useEffect(() => {
    if (!panelOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [panelOpen]);

  if (!table || cartOpen) return null;

  const isDelivery = table.slug === "delivery";
  if (isDelivery) return null;

  function request(next: TableAssistanceKind) {
    if (!table) return;
    setError(null);
    setFeedback(null);
    startTransition(async () => {
      const result = await requestTableAssistanceAction(
        table.restaurant_id,
        table.id,
        next
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setKind(next);
      setFeedback(result.success ?? "Solicitud enviada");
      window.setTimeout(() => setPanelOpen(false), 1200);
    });
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-start p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setFeedback(null);
            setPanelOpen(true);
          }}
          className={cn(
            "pointer-events-auto inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold shadow-lg transition active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            kind && "ring-2 ring-offset-2"
          )}
          style={{
            backgroundColor: "var(--item-bg)",
            color: "var(--item-name-color)",
            borderColor: "var(--category-container-border)",
            ...(kind
              ? {
                  boxShadow:
                    "0 0 0 2px color-mix(in srgb, var(--tab-active-bg) 55%, transparent)",
                }
              : {}),
          }}
          aria-label={
            kind ? KIND_LABELS[kind] : "Llamar mesero o pedir la cuenta"
          }
        >
          <Bell
            className={cn("h-5 w-5", kind && "animate-pulse")}
            style={{ color: "var(--tab-active-bg)" }}
            aria-hidden
          />
          <span className="max-w-[9rem] truncate text-left leading-tight">
            {kind ? KIND_LABELS[kind] : "¿Necesitás algo?"}
          </span>
        </button>
      </div>

      {panelOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setPanelOpen(false)}
            aria-label="Cerrar"
          />
          <div
            className="relative z-10 w-full min-w-0 max-w-lg overflow-hidden rounded-t-2xl border shadow-xl sm:rounded-2xl"
            style={{
              backgroundColor: "var(--item-bg)",
              borderColor: "var(--item-border)",
              color: "var(--item-name-color)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistance-title"
          >
            <div
              className="flex items-center justify-between border-b px-4 py-4"
              style={{ borderColor: "var(--item-border)" }}
            >
              <div>
                <h2 id="assistance-title" className="text-lg font-semibold">
                  Mesa {table.name}
                </h2>
                <p className="mt-0.5 text-xs opacity-70">
                  Avisá al personal del local
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3 p-4">
              {kind ? (
                <p
                  className="rounded-xl px-3 py-2 text-sm font-medium"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--tab-active-bg) 14%, transparent)",
                    color: "var(--tab-active-bg)",
                  }}
                >
                  {KIND_LABELS[kind]}. El local ya fue notificado.
                </p>
              ) : null}

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
              {feedback ? (
                <p className="text-sm font-medium opacity-80">{feedback}</p>
              ) : null}

              <button
                type="button"
                disabled={isPending}
                onClick={() => request("waiter")}
                className="flex h-14 items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60"
                style={{
                  backgroundColor: "var(--tab-active-bg)",
                  color: "var(--tab-active-text)",
                }}
              >
                <Bell className="h-5 w-5 shrink-0" aria-hidden />
                <span>
                  <span className="block">Llamar mesero</span>
                  <span className="block text-xs font-normal opacity-90">
                    Para pedir algo o consultar
                  </span>
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => request("bill")}
                className="flex h-14 items-center gap-3 rounded-xl border px-4 text-left text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60"
                style={{
                  borderColor: "var(--item-border)",
                  backgroundColor: "var(--body-bg)",
                  color: "var(--item-name-color)",
                }}
              >
                <Receipt
                  className="h-5 w-5 shrink-0"
                  style={{ color: "var(--tab-active-bg)" }}
                  aria-hidden
                />
                <span>
                  <span className="block">Pedir la cuenta</span>
                  <span className="block text-xs font-normal opacity-70">
                    Cuando terminaron de comer
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
