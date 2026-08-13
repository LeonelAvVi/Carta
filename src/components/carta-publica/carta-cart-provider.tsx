"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLineItem, TableContext } from "@/lib/types";
import { formatPriceBs } from "@/lib/utils";

type CartaCartContextValue = {
  table: TableContext | null;
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartLineItem, "key" | "quantity">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  formatSubtotal: () => string;
};

const CartaCartContext = createContext<CartaCartContextValue | null>(null);

function buildCartKey(
  menuItemId: string,
  variationId?: string | null
): string {
  return variationId ? `${menuItemId}:${variationId}` : menuItemId;
}

function getStorageKey(restaurantId: string, tableId: string): string {
  return `carta-cart:${restaurantId}:${tableId}`;
}

type CartaCartProviderProps = {
  restaurantId: string;
  table: TableContext | null;
  children: React.ReactNode;
};

export function CartaCartProvider({
  restaurantId,
  table,
  children,
}: CartaCartProviderProps) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!table) {
      setItems([]);
      setHydrated(true);
      return;
    }

    try {
      const raw = localStorage.getItem(getStorageKey(restaurantId, table.id));
      if (raw) {
        const parsed = JSON.parse(raw) as CartLineItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [restaurantId, table]);

  useEffect(() => {
    if (!hydrated || !table) return;
    localStorage.setItem(
      getStorageKey(restaurantId, table.id),
      JSON.stringify(items)
    );
  }, [items, hydrated, restaurantId, table]);

  const addItem = useCallback((item: Omit<CartLineItem, "key" | "quantity">) => {
    if (!table) return;

    const key = buildCartKey(item.menu_item_id, item.variation_id);
    setItems((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) {
        return current.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...current, { ...item, key, quantity: 1 }];
    });
  }, [table]);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((line) => line.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity < 1) {
      setItems((current) => current.filter((line) => line.key !== key));
      return;
    }
    setItems((current) =>
      current.map((line) => (line.key === key ? { ...line, quantity } : line))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (table) {
      localStorage.removeItem(getStorageKey(restaurantId, table.id));
    }
  }, [restaurantId, table]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, line) => sum + line.unit_price * line.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items]
  );

  const value = useMemo<CartaCartContextValue>(
    () => ({
      table,
      items,
      itemCount,
      subtotal,
      isOpen,
      setOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      formatSubtotal: () => formatPriceBs(subtotal),
    }),
    [
      table,
      items,
      itemCount,
      subtotal,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  );

  return (
    <CartaCartContext.Provider value={value}>{children}</CartaCartContext.Provider>
  );
}

export function useCartaCart(): CartaCartContextValue {
  const ctx = useContext(CartaCartContext);
  if (!ctx) {
    throw new Error("useCartaCart debe usarse dentro de CartaCartProvider");
  }
  return ctx;
}

export function useCartaCartOptional(): CartaCartContextValue | null {
  return useContext(CartaCartContext);
}
