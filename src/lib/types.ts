export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

export type RestaurantRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

export type FontStyle = "clasica" | "moderna" | "editorial" | "tecnica";
export type TabBorderRadius = "pill" | "rounded" | "square";
export type CartTemplate = "elegante" | "casual" | "atrevida";

export type RestaurantThemeRow = {
  id: string;
  restaurant_id: string;
  cart_template: CartTemplate;
  header_bg_color: string;
  header_bg_image_url: string | null;
  header_overlay_color: string;
  header_overlay_opacity: number;
  header_name_color: string;
  header_desc_color: string;
  logo_border_color: string;
  show_hours: boolean;
  hours_text: string;
  hours_color: string;
  font_style: FontStyle;
  body_bg_color: string;
  body_bg_image_url: string | null;
  body_overlay_color: string;
  body_overlay_opacity: number;
  tab_bg_color: string;
  tab_text_color: string;
  tab_border_color: string;
  tab_active_bg_color: string;
  tab_active_text_color: string;
  tab_active_border_color: string;
  tab_border_radius: TabBorderRadius;
  category_container_bg: string;
  category_container_border: string;
  category_title_color: string;
  category_accent_color: string;
  item_bg_color: string;
  item_border_color: string;
  item_name_color: string;
  item_desc_color: string;
  item_price_color: string;
  item_image_placeholder_bg: string;
  badge_featured_bg: string;
  badge_featured_text_color: string;
  badge_featured_label: string;
  badge_unavailable_bg: string;
  badge_unavailable_text_color: string;
  badge_unavailable_label: string;
  variation_bg_color: string;
  variation_text_color: string;
  variation_price_color: string;
  footer_bg_color: string;
  footer_text_color: string;
  show_instagram: boolean;
  instagram_url: string | null;
  show_facebook: boolean;
  facebook_url: string | null;
  show_whatsapp: boolean;
  whatsapp_number: string | null;
  show_tiktok: boolean;
  tiktok_url: string | null;
  social_icon_bg: string;
  social_icon_color: string;
  show_address: boolean;
  show_phone: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  restaurant_id: string;
  name: string;
  position: number;
  is_active: boolean;
  is_favorite: boolean;
  favorite_position: number | null;
};

export type ItemVariationRow = {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  position: number;
  is_available: boolean;
};

export type MenuItemVariation = {
  description: string;
  price: number;
};

export type MenuItemRow = {
  id: string;
  category_id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  variations: MenuItemVariation[];
  item_variations: ItemVariationRow[];
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  position: number;
  created_at: string;
};

export type CategoryWithProducts = CategoryRow & {
  menu_items: MenuItemRow[];
};

export type SubscriptionRow = {
  id: string;
  restaurant_id: string;
  plan: "trial" | "basic" | "pro" | "premium";
  status: "active" | "expired" | "cancelled";
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
};

export type DashboardStats = {
  categoriesCount: number;
  menuItemsCount: number;
  cartaViewsCount: number;
  availableMenuItemsCount: number;
};

export type RestaurantInsert = Pick<
  RestaurantRow,
  "name" | "slug" | "description" | "logo_url" | "primary_color"
> & {
  owner_id?: string;
  is_active?: boolean;
};

export type RestaurantUpdate = Partial<
  Pick<
    RestaurantRow,
    | "name"
    | "slug"
    | "description"
    | "logo_url"
    | "primary_color"
    | "address"
    | "phone"
    | "is_active"
  >
>;

export type PublicCartaPayload = {
  restaurant: RestaurantRow;
  theme: RestaurantThemeRow;
  sections: {
    favorites: CategoryWithProducts[];
    categories: CategoryWithProducts[];
    allNavCategories: CategoryWithProducts[];
  };
};
