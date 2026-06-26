"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
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

export function DashboardShell({
  children,
  displayName,
  email,
  access,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => (access?.role === "employee" ? employeeNavItems : ownerNavItems),
    [access?.role]
  );

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <Link
          href={access?.role === "employee" ? "/dashboard/staff" : "/dashboard"}
          className="text-base font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          onClick={() => setMobileOpen(false)}
        >
          Carta
        </Link>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        >
          <span aria-hidden className="text-lg leading-none">
            ×
          </span>
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="text-sm font-medium text-slate-900">Hola, {displayName}</p>
        {email ? <p className="mt-1 truncate text-xs text-slate-500">{email}</p> : null}
        {access?.role === "employee" ? (
          <p className="mt-2 text-xs font-medium text-amber-700">Modo empleado</p>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 pb-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className={cn("text-sm font-medium", active ? "text-white" : "text-slate-900")}>
                {item.label}
              </span>
              {item.description ? (
                <span
                  className={cn(
                    "text-xs",
                    active ? "text-white/80" : "text-slate-500 group-hover:text-slate-600"
                  )}
                >
                  {item.description}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <LogoutButton />
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir navegación"
            >
              <span aria-hidden className="text-base leading-none">
                ☰
              </span>
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">Panel</p>
              <p className="truncate text-xs text-slate-500 md:hidden">Hola, {displayName}</p>
            </div>
          </div>

          <div className="hidden md:block">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[18rem_1fr]">
        <div className="hidden md:block">{sidebar}</div>
        <main className="px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar"
          />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
        </div>
      ) : null}
    </div>
  );
}
