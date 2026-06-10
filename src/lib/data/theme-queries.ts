import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RESTAURANT_THEME } from "@/lib/theme/theme-utils";
import type { RestaurantThemeRow } from "@/lib/types";

const THEME_SELECT = `
  id, restaurant_id, cart_template,
  header_bg_color, header_bg_image_url, header_overlay_color, header_overlay_opacity,
  header_name_color, header_desc_color, logo_border_color,
  show_hours, hours_text, hours_color, font_style,
  body_bg_color, body_bg_image_url, body_overlay_color, body_overlay_opacity,
  tab_bg_color, tab_text_color, tab_border_color,
  tab_active_bg_color, tab_active_text_color, tab_active_border_color, tab_border_radius,
  category_container_bg, category_container_border, category_title_color, category_accent_color,
  item_bg_color, item_border_color, item_name_color, item_desc_color, item_price_color,
  item_image_placeholder_bg,
  badge_featured_bg, badge_featured_text_color, badge_featured_label,
  badge_unavailable_bg, badge_unavailable_text_color, badge_unavailable_label,
  variation_bg_color, variation_text_color, variation_price_color,
  footer_bg_color, footer_text_color,
  show_instagram, instagram_url, show_facebook, facebook_url,
  show_whatsapp, whatsapp_number, show_tiktok, tiktok_url,
  social_icon_bg, social_icon_color, show_address, show_phone,
  created_at, updated_at
`;

export const getRestaurantTheme = cache(
  async (restaurantId: string): Promise<RestaurantThemeRow> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("restaurant_theme")
      .select(THEME_SELECT)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (error) {
      console.error("getRestaurantTheme:", error.message);
    }

    if (data) {
      return {
        ...(data as RestaurantThemeRow),
        cart_template: (data as RestaurantThemeRow).cart_template ?? "elegante",
      };
    }

    return {
      id: "",
      restaurant_id: restaurantId,
      ...DEFAULT_RESTAURANT_THEME,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
);

export const getOwnerRestaurantTheme = cache(
  async (): Promise<{ theme: RestaurantThemeRow; restaurantId: string } | null> => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (restaurantError || !restaurant) return null;

    const theme = await getRestaurantTheme(restaurant.id);
    return { theme, restaurantId: restaurant.id };
  }
);
