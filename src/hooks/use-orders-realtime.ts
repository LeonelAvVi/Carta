"use client";

import type {
  AuthChangeEvent,
  REALTIME_SUBSCRIBE_STATES,
  RealtimePostgresChangesPayload,
  Session,
} from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  mapOrderWithTable,
  ORDER_WITH_TABLE_SELECT,
  type OrderRowDb,
} from "@/lib/data/order-mappers";
import { createClient } from "@/lib/supabase/client";
import type { OrderItemRow, OrderRow, OrderWithTable } from "@/lib/types";

const LOG_PREFIX = "[orders-realtime]";

type OrderChangePayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

export type OrdersRealtimeStatus =
  | "connecting"
  | "live"
  | "no-auth"
  | "error"
  | "polling";

type UseOrdersRealtimeResult = {
  orders: OrderWithTable[];
  setOrders: React.Dispatch<React.SetStateAction<OrderWithTable[]>>;
  isLive: boolean;
  status: OrdersRealtimeStatus;
  lastError: string | null;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

function logWarn(...args: unknown[]) {
  console.warn(LOG_PREFIX, ...args);
}

function logError(...args: unknown[]) {
  console.error(LOG_PREFIX, ...args);
}

function orderFromPayload(
  row: Record<string, unknown>,
  table: OrderWithTable["table"]
): OrderWithTable {
  return {
    id: row.id as string,
    restaurant_id: row.restaurant_id as string,
    table_id: row.table_id as string,
    items: (row.items ?? []) as OrderItemRow[],
    status: row.status as OrderRow["status"],
    total: Number(row.total),
    notes: (row.notes as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    table,
  };
}

export function useOrdersRealtime(
  restaurantId: string,
  initialOrders: OrderWithTable[]
): UseOrdersRealtimeResult {
  const [orders, setOrders] = useState(initialOrders);
  const [status, setStatus] = useState<OrdersRealtimeStatus>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const refetchOrders = useCallback(async () => {
    const supabase = createClient();
    log("refetch manual/polling para restaurantId:", restaurantId);

    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_WITH_TABLE_SELECT)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      logError("refetch falló:", error.message, error.code, error.details);
      setLastError(error.message);
      return;
    }

    log("refetch OK, pedidos:", data?.length ?? 0);
    setOrders((data ?? []).map((row: OrderRowDb) => mapOrderWithTable(row)));
  }, [restaurantId]);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;

    logWarn("activando polling cada 15s (fallback sin Realtime)");
    setStatus("polling");
    void refetchOrders();

    pollIntervalRef.current = setInterval(() => {
      void refetchOrders();
    }, 15_000);
  }, [refetchOrders]);

  const stopPolling = useCallback(() => {
    if (!pollIntervalRef.current) return;
    clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    log("montando hook, restaurantId:", restaurantId);

    async function fetchOrderWithRetry(
      orderId: string,
      attempts = 3
    ): Promise<OrderWithTable | null> {
      for (let attempt = 1; attempt <= attempts; attempt += 1) {
        const { data, error } = await supabase
          .from("orders")
          .select(ORDER_WITH_TABLE_SELECT)
          .eq("id", orderId)
          .maybeSingle();

        if (!error && data) {
          log("fetchOrder OK", orderId, `(intento ${attempt})`);
          return mapOrderWithTable(data);
        }

        logWarn(
          "fetchOrder falló",
          orderId,
          `(intento ${attempt}/${attempts})`,
          error?.message,
          error?.code
        );

        if (attempt < attempts) await sleep(400);
      }

      return null;
    }

    async function fetchTable(tableId: string) {
      const { data, error } = await supabase
        .from("tables")
        .select("id, name, slug")
        .eq("id", tableId)
        .maybeSingle();

      if (error || !data) {
        logWarn("fetchTable falló", tableId, error?.message);
        return null;
      }

      return data;
    }

    async function handleInsert(row: Record<string, unknown>) {
      log("evento INSERT", row.id, row);

      const table = await fetchTable(row.table_id as string);
      if (!table) {
        const fetched = await fetchOrderWithRetry(row.id as string);
        if (!fetched) {
          logError("INSERT sin poder resolver mesa ni pedido", row.id);
          void refetchOrders();
          return;
        }

        setOrders((prev) => {
          if (prev.some((o) => o.id === fetched.id)) return prev;
          return [fetched, ...prev].slice(0, 100);
        });
        return;
      }

      const order = orderFromPayload(row, table);
      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        return [order, ...prev].slice(0, 100);
      });
    }

    async function handleUpdate(row: Record<string, unknown>) {
      log("evento UPDATE", row.id, row);

      const fetched = await fetchOrderWithRetry(row.id as string, 2);
      if (!fetched) {
        logWarn("UPDATE sin fetch, aplicando payload directo", row.id);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === row.id
              ? {
                  ...o,
                  status: row.status as OrderRow["status"],
                  total: Number(row.total),
                  items: (row.items ?? o.items) as OrderItemRow[],
                  notes: (row.notes as string | null) ?? o.notes,
                  updated_at: row.updated_at as string,
                }
              : o
          )
        );
        return;
      }

      setOrders((prev) => prev.map((o) => (o.id === fetched.id ? fetched : o)));
    }

    function handleDelete(row: Record<string, unknown>) {
      const deletedId = row.id as string | undefined;
      log("evento DELETE", deletedId, row);
      if (!deletedId) return;
      setOrders((prev) => prev.filter((o) => o.id !== deletedId));
    }

    async function subscribe() {
      if (cancelled || subscribedRef.current) {
        log("subscribe omitido (ya suscrito o desmontado)");
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        logError("getSession error:", sessionError.message);
        setLastError(sessionError.message);
        setStatus("error");
        startPolling();
        return;
      }

      if (!session) {
        logWarn("sin sesión autenticada — Realtime requiere login del dueño");
        setStatus("no-auth");
        setLastError("No hay sesión activa");
        startPolling();
        return;
      }

      log("sesión OK, user:", session.user.id, "email:", session.user.email);

      if (cancelled || subscribedRef.current) return;

      subscribedRef.current = true;
      const channelName = `orders:${restaurantId}`;
      log("suscribiendo canal:", channelName);

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload: OrderChangePayload) => {
            void handleInsert(payload.new as Record<string, unknown>);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload: OrderChangePayload) => {
            void handleUpdate(payload.new as Record<string, unknown>);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload: OrderChangePayload) => {
            handleDelete(payload.old as Record<string, unknown>);
          }
        )
        .subscribe((subscribeStatus: `${REALTIME_SUBSCRIBE_STATES}`, err?: Error) => {
          log("subscribe status:", subscribeStatus, err ?? "(sin error)");

          if (subscribeStatus === "SUBSCRIBED") {
            setStatus("live");
            setLastError(null);
            stopPolling();
            return;
          }

          if (subscribeStatus === "CHANNEL_ERROR") {
            const message =
              err instanceof Error
                ? err.message
                : typeof err === "string"
                  ? err
                  : "Error de canal Realtime";
            logError("CHANNEL_ERROR:", message, err);
            setLastError(message);
            setStatus("error");
            startPolling();
            return;
          }

          if (subscribeStatus === "TIMED_OUT") {
            logError("TIMED_OUT al conectar Realtime");
            setLastError("Conexión Realtime expiró (TIMED_OUT)");
            setStatus("error");
            startPolling();
            return;
          }

          if (subscribeStatus === "CLOSED") {
            logWarn("canal CLOSED");
            setStatus("connecting");
          }
        });
    }

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      log("auth state:", event, session?.user?.id ?? "sin user");

      if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        session
      ) {
        void subscribe();
      }

      if (event === "SIGNED_OUT") {
        logWarn("SIGNED_OUT, deteniendo Realtime");
        subscribedRef.current = false;
        if (channel) {
          void supabase.removeChannel(channel);
          channel = null;
        }
        setStatus("no-auth");
        startPolling();
      }
    });

    return () => {
      cancelled = true;
      subscribedRef.current = false;
      log("cleanup canal, restaurantId:", restaurantId);
      authSubscription.unsubscribe();
      stopPolling();
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [restaurantId, refetchOrders, startPolling, stopPolling]);

  return {
    orders,
    setOrders,
    isLive: status === "live",
    status,
    lastError,
  };
}
