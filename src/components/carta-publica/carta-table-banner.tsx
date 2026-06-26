"use client";

import { useCartaCart } from "@/components/carta-publica/carta-cart-provider";

export function CartaTableBanner() {
  const { table } = useCartaCart();

  if (!table) return null;

  return (
    <div
      className="border-b px-4 py-2 text-center text-sm font-medium"
      style={{
        backgroundColor: "color-mix(in srgb, var(--tab-active-bg) 12%, var(--body-bg))",
        color: "var(--item-name-color)",
        borderColor: "var(--category-container-border)",
      }}
    >
      Estás en la mesa <span className="font-bold">{table.name}</span>
    </div>
  );
}
