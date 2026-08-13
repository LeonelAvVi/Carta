"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type DashboardNavProgressProps = {
  pendingHref: string | null;
  onSettled: () => void;
};

/** Barra superior mientras Next carga la ruta del panel. */
export function DashboardNavProgress({
  pendingHref,
  onSettled,
}: DashboardNavProgressProps) {
  const pathname = usePathname();
  const active = Boolean(pendingHref);

  useEffect(() => {
    if (!pendingHref) return;
    if (
      pathname === pendingHref ||
      (pendingHref !== "/dashboard" && pathname?.startsWith(pendingHref))
    ) {
      onSettled();
    }
  }, [pathname, pendingHref, onSettled]);

  // Por si la navegación falla o se cancela: no dejar la barra colgada.
  useEffect(() => {
    if (!pendingHref) return;
    const id = window.setTimeout(onSettled, 10000);
    return () => window.clearTimeout(id);
  }, [pendingHref, onSettled]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden={!active}
      role="status"
      aria-live="polite"
      aria-busy={active}
    >
      <span className="sr-only">{active ? "Cargando sección…" : ""}</span>
      {active ? (
        <div className="absolute inset-0 bg-white/35" />
      ) : null}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1/2 rounded-r-full bg-white/90 shadow-[0_0_16px_rgba(255,255,255,0.8)] transition-opacity duration-200",
          active ? "opacity-100 motion-safe:animate-nav-progress" : "opacity-0"
        )}
      />
    </div>
  );
}
