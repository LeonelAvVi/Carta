import {
  absolutizeAppUrl,
  getClientAppBaseUrl,
  getConfiguredAppBaseUrl,
} from "@/lib/carta/app-url";

export const DELIVERY_TABLE_SLUG = "delivery";
export const DELIVERY_TABLE_NAME = "Delivery";

function resolveBaseUrl(baseUrl?: string): string {
  if (baseUrl) return baseUrl.replace(/\/$/, "");
  const configured = getConfiguredAppBaseUrl();
  if (configured) return configured;
  return getClientAppBaseUrl();
}

export function getTableCartaUrl(
  restaurantSlug: string,
  tableSlug: string,
  baseUrl?: string
): string {
  const path = `/carta/${restaurantSlug}?table=${encodeURIComponent(tableSlug)}`;
  return absolutizeAppUrl(path, resolveBaseUrl(baseUrl));
}

/** Alias /menu/ → misma carta con contexto de mesa */
export function getTableMenuUrl(
  restaurantSlug: string,
  tableSlug: string,
  baseUrl?: string
): string {
  const path = `/menu/${restaurantSlug}?table=${encodeURIComponent(tableSlug)}`;
  return absolutizeAppUrl(path, resolveBaseUrl(baseUrl));
}

/** QR de delivery: reutiliza el flujo de pedidos con mesa reservada "delivery". */
export function getDeliveryCartaUrl(
  restaurantSlug: string,
  baseUrl?: string
): string {
  return getTableCartaUrl(restaurantSlug, DELIVERY_TABLE_SLUG, baseUrl);
}

export function isDeliveryTableSlug(slug: string): boolean {
  return slug === DELIVERY_TABLE_SLUG;
}
