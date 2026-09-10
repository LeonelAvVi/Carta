import { BRAND_SITE_URL } from "@/lib/brand/contact";

/**
 * Base de la app para enlaces públicos / QR.
 * Prioridad: NEXT_PUBLIC_APP_URL → dominio oficial → origin del request/navegador
 * (ignorando hosts efímeros de Vercel tipo *.vercel.app).
 */
export function getConfiguredAppBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/** Hosts de preview/deploy de Vercel; no deben usarse en QR ni enlaces públicos. */
export function isEphemeralVercelHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const h = host.toLowerCase().split(":")[0];
  return h.endsWith(".vercel.app");
}

export function getCanonicalAppBaseUrl(): string {
  return getConfiguredAppBaseUrl() ?? BRAND_SITE_URL;
}

export function buildBaseUrlFromHost(
  host: string | null | undefined,
  proto: string | null | undefined
): string | null {
  if (!host) return null;
  if (isEphemeralVercelHost(host)) {
    return getCanonicalAppBaseUrl();
  }
  const protocol =
    proto === "https" || proto === "http"
      ? proto
      : host.includes("localhost") || host.startsWith("127.")
        ? "http"
        : "https";
  return `${protocol}://${host}`.replace(/\/$/, "");
}

/** En Server Components: usa env o dominio oficial. */
export function getServerAppBaseUrl(): string {
  return getCanonicalAppBaseUrl();
}

export function absolutizeAppUrl(pathOrUrl: string, baseUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = baseUrl.replace(/\/$/, "");
  if (!base) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

/** En el navegador: env / dominio oficial; localhost sí usa window. */
export function getClientAppBaseUrl(): string {
  const configured = getConfiguredAppBaseUrl();
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const host = window.location.host;
    if (isEphemeralVercelHost(host)) return BRAND_SITE_URL;
    if (host.includes("localhost") || host.startsWith("127.")) {
      return window.location.origin;
    }
    // Dominio custom o alias estable
    if (host === "tuqarta.app" || host.endsWith(".tuqarta.app")) {
      return window.location.origin;
    }
  }

  return BRAND_SITE_URL;
}
