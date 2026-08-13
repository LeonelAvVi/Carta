"use client";

import { CartaAssistanceButton } from "@/components/carta-publica/carta-assistance-button";
import { CartaCartBar, CartaCartPanel } from "@/components/carta-publica/carta-cart-panel";
import { CartaTableBanner } from "@/components/carta-publica/carta-table-banner";
import type { ReactNode } from "react";

type CartaOrderingShellProps = {
  children: ReactNode;
};

/** Envuelve la carta pública con banner de mesa y UI de carrito/pedido */
export function CartaOrderingShell({ children }: CartaOrderingShellProps) {
  return (
    <>
      <CartaTableBanner />
      {children}
      <CartaAssistanceButton />
      <CartaCartBar />
      <CartaCartPanel />
    </>
  );
}
