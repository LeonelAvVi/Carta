"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { CartaThemeContext } from "@/components/carta-publica/carta-theme-context";
import {
  getFontStyleClass,
  mergeTheme,
  themeToCssVars,
} from "@/lib/theme/theme-utils";
import type { RestaurantThemeRow } from "@/lib/types";

export const CARTA_THEME_PREVIEW_MESSAGE = "CARTA_THEME_PREVIEW";

type CartaThemeRootProps = {
  theme: RestaurantThemeRow;
  previewMode?: boolean;
  children: ReactNode;
};

export function CartaThemeRoot({
  theme: initialTheme,
  previewMode = false,
  children,
}: CartaThemeRootProps) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  const applyPatch = useCallback((patch: Partial<RestaurantThemeRow>) => {
    setTheme((current) => mergeTheme(current, patch));
  }, []);

  useEffect(() => {
    if (!previewMode) return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; theme?: Partial<RestaurantThemeRow> };
      if (data?.type !== CARTA_THEME_PREVIEW_MESSAGE || !data.theme) return;
      applyPatch(data.theme);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [previewMode, applyPatch]);

  const cssVars = useMemo(() => themeToCssVars(theme), [theme]);
  const fontClass = getFontStyleClass(theme.font_style);

  const headerHasImage = Boolean(theme.header_bg_image_url);
  const bodyHasImage = Boolean(theme.body_bg_image_url);

  const shellStyle: CSSProperties = {
    ...cssVars,
    backgroundColor: "var(--body-bg)",
    color: "var(--item-name-color)",
    ...(bodyHasImage && theme.cart_template === "elegante"
      ? {
          backgroundImage: `linear-gradient(var(--body-overlay-color), var(--body-overlay-color)), var(--body-bg-image)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
  };

  return (
    <CartaThemeContext.Provider value={theme}>
      <div
        id="carta-theme-root"
        data-cart-template={theme.cart_template}
        className={`min-h-screen ${fontClass}`}
        style={shellStyle}
        data-show-hours={theme.show_hours ? "true" : "false"}
        data-show-instagram={theme.show_instagram ? "true" : "false"}
        data-show-facebook={theme.show_facebook ? "true" : "false"}
        data-show-whatsapp={theme.show_whatsapp ? "true" : "false"}
        data-show-tiktok={theme.show_tiktok ? "true" : "false"}
        data-show-address={theme.show_address ? "true" : "false"}
        data-show-phone={theme.show_phone ? "true" : "false"}
        data-header-has-image={headerHasImage ? "true" : "false"}
      >
        {children}
      </div>
    </CartaThemeContext.Provider>
  );
}
