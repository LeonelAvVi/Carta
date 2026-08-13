import { headers } from "next/headers";
import {
  absolutizeAppUrl,
  buildBaseUrlFromHost,
  getConfiguredAppBaseUrl,
} from "@/lib/carta/app-url";

/** Base absoluta en Server Components (env o Host actual, ej. localhost:3000). */
export function getRequestAppBaseUrl(): string {
  const configured = getConfiguredAppBaseUrl();
  if (configured) return configured;

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto");
  return buildBaseUrlFromHost(host, proto) ?? "";
}

export function toAbsolutePublicUrl(pathOrUrl: string): string {
  return absolutizeAppUrl(pathOrUrl, getRequestAppBaseUrl());
}
