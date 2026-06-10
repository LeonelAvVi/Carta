"use client";

import { createContext, useContext } from "react";
import type { RestaurantThemeRow } from "@/lib/types";

export const CartaThemeContext = createContext<RestaurantThemeRow | null>(null);

export function useCartaTheme(): RestaurantThemeRow {
  const theme = useContext(CartaThemeContext);
  if (!theme) {
    throw new Error("useCartaTheme debe usarse dentro de CartaThemeRoot");
  }
  return theme;
}
