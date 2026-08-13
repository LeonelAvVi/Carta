/**
 * Base de la app para enlaces públicos / QR.
 * Prioridad: NEXT_PUBLIC_APP_URL → origin del request/navegador.
 */
export function getConfiguredAppBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export function buildBaseUrlFromHost(
  host: string | null | undefined,
  proto: string | null | undefined
): string | null {
  if (!host) return null;
  const protocol =
    proto === "https" || proto === "http"
      ? proto
      : host.includes("localhost") || host.startsWith("127.")
        ? "http"
        : "https";
  return `${protocol}://${host}`.replace(/\/$/, "");
}

/** En Server Components: usa env o Host del request. */
export function getServerAppBaseUrl(): string {
  const configured = getConfiguredAppBaseUrl();
  if (configured) return configured;

  // Import dinámico evitado: callers pasan host, o usamos headers en getRequestAppBaseUrl
  return "";
}

export function absolutizeAppUrl(pathOrUrl: string, baseUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = baseUrl.replace(/\/$/, "");
  if (!base) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

/** En el navegador: env o window.location.origin. */
export function getClientAppBaseUrl(): string {
  const configured = getConfiguredAppBaseUrl();
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
