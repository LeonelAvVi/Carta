export function getTableCartaUrl(
  restaurantSlug: string,
  tableSlug: string
): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const path = `/carta/${restaurantSlug}?table=${encodeURIComponent(tableSlug)}`;
  if (base) return `${base}${path}`;
  return path;
}

/** Alias /menu/ → misma carta con contexto de mesa */
export function getTableMenuUrl(
  restaurantSlug: string,
  tableSlug: string
): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const path = `/menu/${restaurantSlug}?table=${encodeURIComponent(tableSlug)}`;
  if (base) return `${base}${path}`;
  return path;
}
