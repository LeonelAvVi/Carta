import { z } from "zod";

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido");

const opacitySchema = z.coerce.number().int().min(0).max(80);

export const restaurantThemeSchema = z.object({
  cart_template: z.enum(["elegante", "casual", "atrevida"]),
  header_bg_color: hexColorSchema,
  header_bg_image_url: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  header_overlay_color: hexColorSchema,
  header_overlay_opacity: opacitySchema,
  header_name_color: hexColorSchema,
  header_desc_color: hexColorSchema,
  logo_border_color: hexColorSchema,
  show_hours: z.boolean(),
  hours_text: z.string().min(1, "El horario es obligatorio").max(200),
  hours_color: hexColorSchema,
  font_style: z.enum(["clasica", "moderna", "editorial", "tecnica"]),
  body_bg_color: hexColorSchema,
  body_bg_image_url: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  body_overlay_color: hexColorSchema,
  body_overlay_opacity: opacitySchema,
  tab_bg_color: hexColorSchema,
  tab_text_color: hexColorSchema,
  tab_border_color: hexColorSchema,
  tab_active_bg_color: hexColorSchema,
  tab_active_text_color: hexColorSchema,
  tab_active_border_color: hexColorSchema,
  tab_border_radius: z.enum(["pill", "rounded", "square"]),
  category_container_bg: hexColorSchema,
  category_container_border: hexColorSchema,
  category_title_color: hexColorSchema,
  category_accent_color: hexColorSchema,
  item_bg_color: hexColorSchema,
  item_border_color: hexColorSchema,
  item_name_color: hexColorSchema,
  item_desc_color: hexColorSchema,
  item_price_color: hexColorSchema,
  item_image_placeholder_bg: hexColorSchema,
  badge_featured_bg: hexColorSchema,
  badge_featured_text_color: hexColorSchema,
  badge_featured_label: z.string().min(1).max(80),
  badge_unavailable_bg: hexColorSchema,
  badge_unavailable_text_color: hexColorSchema,
  badge_unavailable_label: z.string().min(1).max(80),
  variation_bg_color: hexColorSchema,
  variation_text_color: hexColorSchema,
  variation_price_color: hexColorSchema,
  footer_bg_color: hexColorSchema,
  footer_text_color: hexColorSchema,
  show_instagram: z.boolean(),
  instagram_url: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  show_facebook: z.boolean(),
  facebook_url: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  show_whatsapp: z.boolean(),
  whatsapp_number: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  show_tiktok: z.boolean(),
  tiktok_url: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  social_icon_bg: hexColorSchema,
  social_icon_color: hexColorSchema,
  show_address: z.boolean(),
  show_phone: z.boolean(),
});

export type RestaurantThemeInput = z.infer<typeof restaurantThemeSchema>;

export function parseThemeFormData(formData: FormData): RestaurantThemeInput {
  const bool = (key: string) => formData.get(key) === "true";

  const optionalUrl = (key: string) => {
    const value = formData.get(key)?.toString() ?? "";
    return value.trim() ? value.trim() : null;
  };

  const optionalText = (key: string) => {
    const value = formData.get(key)?.toString() ?? "";
    return value.trim() ? value.trim() : null;
  };

  return restaurantThemeSchema.parse({
    cart_template: formData.get("cart_template"),
    header_bg_color: formData.get("header_bg_color"),
    header_bg_image_url: optionalUrl("header_bg_image_url"),
    header_overlay_color: formData.get("header_overlay_color"),
    header_overlay_opacity: formData.get("header_overlay_opacity"),
    header_name_color: formData.get("header_name_color"),
    header_desc_color: formData.get("header_desc_color"),
    logo_border_color: formData.get("logo_border_color"),
    show_hours: bool("show_hours"),
    hours_text: formData.get("hours_text"),
    hours_color: formData.get("hours_color"),
    font_style: formData.get("font_style"),
    body_bg_color: formData.get("body_bg_color"),
    body_bg_image_url: optionalUrl("body_bg_image_url"),
    body_overlay_color: formData.get("body_overlay_color"),
    body_overlay_opacity: formData.get("body_overlay_opacity"),
    tab_bg_color: formData.get("tab_bg_color"),
    tab_text_color: formData.get("tab_text_color"),
    tab_border_color: formData.get("tab_border_color"),
    tab_active_bg_color: formData.get("tab_active_bg_color"),
    tab_active_text_color: formData.get("tab_active_text_color"),
    tab_active_border_color: formData.get("tab_active_border_color"),
    tab_border_radius: formData.get("tab_border_radius"),
    category_container_bg: formData.get("category_container_bg"),
    category_container_border: formData.get("category_container_border"),
    category_title_color: formData.get("category_title_color"),
    category_accent_color: formData.get("category_accent_color"),
    item_bg_color: formData.get("item_bg_color"),
    item_border_color: formData.get("item_border_color"),
    item_name_color: formData.get("item_name_color"),
    item_desc_color: formData.get("item_desc_color"),
    item_price_color: formData.get("item_price_color"),
    item_image_placeholder_bg: formData.get("item_image_placeholder_bg"),
    badge_featured_bg: formData.get("badge_featured_bg"),
    badge_featured_text_color: formData.get("badge_featured_text_color"),
    badge_featured_label: formData.get("badge_featured_label"),
    badge_unavailable_bg: formData.get("badge_unavailable_bg"),
    badge_unavailable_text_color: formData.get("badge_unavailable_text_color"),
    badge_unavailable_label: formData.get("badge_unavailable_label"),
    variation_bg_color: formData.get("variation_bg_color"),
    variation_text_color: formData.get("variation_text_color"),
    variation_price_color: formData.get("variation_price_color"),
    footer_bg_color: formData.get("footer_bg_color"),
    footer_text_color: formData.get("footer_text_color"),
    show_instagram: bool("show_instagram"),
    instagram_url: optionalUrl("instagram_url"),
    show_facebook: bool("show_facebook"),
    facebook_url: optionalUrl("facebook_url"),
    show_whatsapp: bool("show_whatsapp"),
    whatsapp_number: optionalText("whatsapp_number"),
    show_tiktok: bool("show_tiktok"),
    tiktok_url: optionalUrl("tiktok_url"),
    social_icon_bg: formData.get("social_icon_bg"),
    social_icon_color: formData.get("social_icon_color"),
    show_address: bool("show_address"),
    show_phone: bool("show_phone"),
  });
}
