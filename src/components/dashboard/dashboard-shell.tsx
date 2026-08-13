"use client";

import Link from "next/link";
import { Loader2, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/landing/brand-logo";
import { DashboardNavProgress } from "@/components/dashboard/dashboard-nav-progress";
import { LogoutButton } from "@/components/shared/logout-button";
import type { RestaurantAccess } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  description?: string;
};

type DashboardShellProps = {
  children: React.ReactNode;
  displayName: string;
  email?: string | null;
  access: RestaurantAccess | null;
};

const ownerNavItems: NavItem[] = [
  { href: "/dashboard", label: "Panel", description: "Resumen" },
  { href: "/dashboard/restaurante", label: "Restaurante", description: "Datos y branding" },
  { href: "/dashboard/carta", label: "Carta", description: "Categorías y platos" },
  { href: "/dashboard/mesas", label: "Mesas", description: "QR por mesa" },
  { href: "/dashboard/pedidos", label: "Pedidos", description: "Pedidos en vivo" },
  { href: "/dashboard/staff", label: "Mapa de mesas", description: "Vista de mostrador" },
  { href: "/dashboard/equipo", label: "Equipo", description: "Personal del local" },
  { href: "/dashboard/apariencia", label: "Apariencia", description: "Tema de la carta" },
  { href: "/dashboard/analytics", label: "Analytics", description: "Ventas y ranking" },
  { href: "/dashboard/cuenta", label: "Cuenta", description: "Plan y suscripción" },
];

const employeeNavItems: NavItem[] = [
  { href: "/dashboard/staff", label: "Mapa de mesas", description: "Vista de mostrador" },
];

function isRouteActive(pathname: string | null, href: string) {
  return (
    pathname === href ||
    (href !== "/dashboard" && Boolean(pathname?.startsWith(href)))
  );
}

export function DashboardShell({
  children,
  displayName,
  email,
  access,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const navItems = useMemo(
    () => (access?.role === "employee" ? employeeNavItems : ownerNavItems),
    [access?.role]
  );

  const homeHref = access?.role === "employee" ? "/dashboard/staff" : "/dashboard";
  const isNavigating = Boolean(pendingHref);

  const clearPending = useCallback(() => setPendingHref(null), []);

  // Al cambiar de apartado, el contenido vuelve al inicio (sin mover el menú).
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const startNavigation = (href: string) => {
    if (isRouteActive(pathname, href)) return;
    setPendingHref(href);
  };

  const sidebar = (
    <aside className="flex h-full min-h-0 w-72 flex-col border-r border-brand-purple/10 bg-white">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-4">
        <Link
          href={homeHref}
          className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
          onClick={() => {
            startNavigation(homeHref);
            setMobileOpen(false);
          }}
          aria-label="Tu QaRta — panel"
        >
          <BrandLogo markClassName="!h-8 !w-8" />
        </Link>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="shrink-0 px-4 pb-4">
        <p className="text-sm font-semibold text-brand">Hola, {displayName}</p>
        {email ? <p className="mt-1 truncate text-xs text-slate-500">{email}</p> : null}
        {access?.role === "employee" ? (
          <p className="mt-2 inline-flex rounded-full bg-brand-purple/10 px-2.5 py-0.5 text-xs font-semibold text-brand-purple">
            Modo empleado
          </p>
        ) : null}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 pb-4">
        {navItems.map((item) => {
          const active = isRouteActive(pathname, item.href);
          const pending = pendingHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                startNavigation(item.href);
                setMobileOpen(false);
              }}
              className={cn(
                "group flex flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2",
                pending
                  ? "bg-brand-purple/10 text-brand-purple ring-1 ring-brand-purple/25"
                  : active
                    ? "bg-brand-purple/15 text-brand-purple"
                    : "text-slate-700 hover:bg-[#F4F2FF] hover:text-brand-purple"
              )}
              aria-current={active ? "page" : undefined}
              aria-busy={pending || undefined}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    active || pending
                      ? "text-brand-purple"
                      : "text-brand group-hover:text-brand-purple"
                  )}
                >
                  {item.label}
                </span>
                {pending ? (
                  <Loader2
                    className="h-3.5 w-3.5 shrink-0 animate-spin text-brand-purple"
                    aria-hidden
                  />
                ) : null}
              </span>
              {item.description ? (
                <span
                  className={cn(
                    "text-xs",
                    active || pending
                      ? "text-brand-purple/75"
                      : "text-slate-500 group-hover:text-slate-600"
                  )}
                >
                  {pending ? "Cargando…" : item.description}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-brand-purple/10 p-4">
        <LogoutButton />
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#F4F2FF] text-brand">
      <header className="relative z-20 shrink-0 border-b border-brand-purple/10 bg-white/90 backdrop-blur-xl">
        <div className="relative h-1 w-full bg-gradient-to-r from-brand-purple via-[#7B61FF] to-brand-purple">
          <DashboardNavProgress
            pendingHref={pendingHref}
            onSettled={clearPending}
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-purple/20 bg-white text-brand-purple shadow-sm hover:bg-brand-purple hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir navegación"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brand">Panel</p>
              <p className="truncate text-xs text-slate-500 md:hidden">
                Hola, {displayName}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isNavigating ? (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-brand-purple">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Cargando…
              </span>
            ) : (
              <span className="text-xs font-medium text-brand-purple">
                El menú inteligente
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Sidebar y contenido con scroll independiente */}
      <div className="flex min-h-0 flex-1">
        <div className="hidden h-full w-72 shrink-0 md:block">{sidebar}</div>

        <main
          ref={mainRef}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 transition-opacity duration-200 md:px-6 md:py-8",
            isNavigating && "opacity-60"
          )}
        >
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-[#111827]/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col shadow-xl shadow-brand-purple/10">
            {sidebar}
          </div>
        </div>
      ) : null}
    </div>
  );
}
