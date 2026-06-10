import type { RestaurantThemeRow } from "@/lib/types";

export type SocialLinkItem = {
  key: string;
  href: string;
  label: string;
  icon: string;
};

export function getSocialLinks(theme: RestaurantThemeRow): SocialLinkItem[] {
  return [
    theme.show_instagram && theme.instagram_url
      ? { key: "instagram", href: theme.instagram_url, label: "Instagram", icon: "IG" }
      : null,
    theme.show_facebook && theme.facebook_url
      ? { key: "facebook", href: theme.facebook_url, label: "Facebook", icon: "FB" }
      : null,
    theme.show_whatsapp && theme.whatsapp_number
      ? {
          key: "whatsapp",
          href: `https://wa.me/${theme.whatsapp_number.replace(/\D/g, "")}`,
          label: "WhatsApp",
          icon: "WA",
        }
      : null,
    theme.show_tiktok && theme.tiktok_url
      ? { key: "tiktok", href: theme.tiktok_url, label: "TikTok", icon: "TT" }
      : null,
  ].filter(Boolean) as SocialLinkItem[];
}
