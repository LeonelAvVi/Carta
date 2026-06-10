"use client";

import { useCartaTheme } from "@/components/carta-publica/carta-theme-context";
import { AtrevidaCarta } from "@/components/carta-publica/templates/atrevida/atrevida-carta";
import { CasualCarta } from "@/components/carta-publica/templates/casual/casual-carta";
import { EleganteCarta } from "@/components/carta-publica/templates/elegante/elegante-carta";
import type { CartaTemplateProps } from "@/lib/carta/template-types";

export function CartaTemplateRenderer({
  restaurant,
  sections,
}: Omit<CartaTemplateProps, "theme">) {
  const theme = useCartaTheme();

  switch (theme.cart_template) {
    case "casual":
      return <CasualCarta restaurant={restaurant} theme={theme} sections={sections} />;
    case "atrevida":
      return <AtrevidaCarta restaurant={restaurant} theme={theme} sections={sections} />;
    case "elegante":
    default:
      return <EleganteCarta restaurant={restaurant} theme={theme} sections={sections} />;
  }
}
