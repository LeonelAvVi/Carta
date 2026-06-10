import type { CartTemplate, RestaurantThemeRow } from "@/lib/types";

export const CART_TEMPLATE_OPTIONS: Array<{
  value: CartTemplate;
  label: string;
  description: string;
}> = [
  {
    value: "elegante",
    label: "Elegante",
    description: "Header centrado · Lista clásica · Ideal para restaurantes y cafés",
  },
  {
    value: "casual",
    label: "Casual",
    description: "Header horizontal · Grid de cards · Fotos arriba",
  },
  {
    value: "atrevida",
    label: "Divertido-atrevido",
    description: "Estilo oscuro · Sidebar de categorías · Lista densa",
  },
];

export const DEFAULT_RESTAURANT_THEME: Omit<
  RestaurantThemeRow,
  "id" | "restaurant_id" | "created_at" | "updated_at"
> = {
  cart_template: "elegante",
  header_bg_color: "#faf8f5",
  header_bg_image_url: null,
  header_overlay_color: "#000000",
  header_overlay_opacity: 40,
  header_name_color: "#1a1209",
  header_desc_color: "#7a6a58",
  logo_border_color: "#e8e0d4",
  show_hours: true,
  hours_text: "Lun–Sáb 7:00–21:00",
  hours_color: "#7a6a58",
  font_style: "clasica",
  body_bg_color: "#faf8f5",
  body_bg_image_url: null,
  body_overlay_color: "#ffffff",
  body_overlay_opacity: 60,
  tab_bg_color: "#ffffff",
  tab_text_color: "#7a6a58",
  tab_border_color: "#e8e0d4",
  tab_active_bg_color: "#8B4513",
  tab_active_text_color: "#ffffff",
  tab_active_border_color: "#8B4513",
  tab_border_radius: "pill",
  category_container_bg: "#ffffff",
  category_container_border: "#e8e0d4",
  category_title_color: "#1a1209",
  category_accent_color: "#8B4513",
  item_bg_color: "#ffffff",
  item_border_color: "#e8e0d4",
  item_name_color: "#1a1209",
  item_desc_color: "#7a6a58",
  item_price_color: "#8B4513",
  item_image_placeholder_bg: "#f5ede6",
  badge_featured_bg: "#f5ede6",
  badge_featured_text_color: "#5c2d0a",
  badge_featured_label: "⭐ Destacado",
  badge_unavailable_bg: "#fef2f2",
  badge_unavailable_text_color: "#b91c1c",
  badge_unavailable_label: "Agotado",
  variation_bg_color: "#f5ede6",
  variation_text_color: "#5c2d0a",
  variation_price_color: "#8B4513",
  footer_bg_color: "#ffffff",
  footer_text_color: "#7a6a58",
  show_instagram: true,
  instagram_url: null,
  show_facebook: true,
  facebook_url: null,
  show_whatsapp: true,
  whatsapp_number: null,
  show_tiktok: false,
  tiktok_url: null,
  social_icon_bg: "#f5ede6",
  social_icon_color: "#8B4513",
  show_address: true,
  show_phone: true,
};

export const TAB_RADIUS_VALUES: Record<
  RestaurantThemeRow["tab_border_radius"],
  string
> = {
  pill: "100px",
  rounded: "8px",
  square: "0px",
};

export const FONT_STYLE_OPTIONS = [
  { value: "clasica" as const, label: "Clásica", sample: "Playfair Display" },
  { value: "moderna" as const, label: "Moderna", sample: "Poppins" },
  { value: "editorial" as const, label: "Editorial", sample: "Lora" },
  { value: "tecnica" as const, label: "Técnica", sample: "Monospace" },
];

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function themeToCssVars(
  theme: RestaurantThemeRow
): Record<string, string> {
  const headerOverlayAlpha = (theme.header_overlay_opacity / 100).toFixed(2);
  const bodyOverlayAlpha = (theme.body_overlay_opacity / 100).toFixed(2);

  return {
    "--header-bg": theme.header_bg_color,
    "--header-bg-image": theme.header_bg_image_url
      ? `url("${theme.header_bg_image_url}")`
      : "none",
    "--header-overlay-color": hexToRgba(
      theme.header_overlay_color,
      Number(headerOverlayAlpha)
    ),
    "--header-name-color": theme.header_name_color,
    "--header-desc-color": theme.header_desc_color,
    "--logo-border-color": theme.logo_border_color,
    "--hours-color": theme.hours_color,
    "--body-bg": theme.body_bg_color,
    "--body-bg-image": theme.body_bg_image_url
      ? `url("${theme.body_bg_image_url}")`
      : "none",
    "--body-overlay-color": hexToRgba(
      theme.body_overlay_color,
      Number(bodyOverlayAlpha)
    ),
    "--tab-bg": theme.tab_bg_color,
    "--tab-text": theme.tab_text_color,
    "--tab-border": theme.tab_border_color,
    "--tab-active-bg": theme.tab_active_bg_color,
    "--tab-active-text": theme.tab_active_text_color,
    "--tab-active-border": theme.tab_active_border_color,
    "--tab-radius": TAB_RADIUS_VALUES[theme.tab_border_radius],
    "--category-container-bg": theme.category_container_bg,
    "--category-container-border": theme.category_container_border,
    "--category-title-color": theme.category_title_color,
    "--category-accent-color": theme.category_accent_color,
    "--item-bg": theme.item_bg_color,
    "--item-border": theme.item_border_color,
    "--item-name-color": theme.item_name_color,
    "--item-desc-color": theme.item_desc_color,
    "--item-price-color": theme.item_price_color,
    "--item-image-placeholder-bg": theme.item_image_placeholder_bg,
    "--badge-featured-bg": theme.badge_featured_bg,
    "--badge-featured-text": theme.badge_featured_text_color,
    "--badge-unavailable-bg": theme.badge_unavailable_bg,
    "--badge-unavailable-text": theme.badge_unavailable_text_color,
    "--variation-bg": theme.variation_bg_color,
    "--variation-text": theme.variation_text_color,
    "--variation-price": theme.variation_price_color,
    "--footer-bg": theme.footer_bg_color,
    "--footer-text": theme.footer_text_color,
    "--social-icon-bg": theme.social_icon_bg,
    "--social-icon-color": theme.social_icon_color,
  };
}

export function getFontStyleClass(fontStyle: RestaurantThemeRow["font_style"]): string {
  switch (fontStyle) {
    case "moderna":
      return "font-theme-moderna";
    case "editorial":
      return "font-theme-editorial";
    case "tecnica":
      return "font-theme-tecnica";
    case "clasica":
    default:
      return "font-theme-clasica";
  }
}

export function mergeTheme(
  base: RestaurantThemeRow,
  patch: Partial<RestaurantThemeRow>
): RestaurantThemeRow {
  return { ...base, ...patch };
}
