import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  getDashboardStats,
  getOwnerRestaurant,
  getPublicCartaUrl,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Analytics | Carta",
};

export default async function AnalyticsPage() {
  const restaurant = await getOwnerRestaurant();

  if (!restaurant) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="mt-2 text-slate-600">
          Configura tu restaurante para ver métricas de visitas.
        </p>
        <Link
          href="/dashboard/restaurante"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ir a Restaurante
        </Link>
      </section>
    );
  }

  const stats = await getDashboardStats(restaurant.id);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="mt-2 text-slate-600">
          Visitas a la carta pública de{" "}
          <span className="font-medium text-slate-900">{restaurant.name}</span>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Enlace: {getPublicCartaUrl(restaurant.slug)}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Visitas totales"
          value={stats.cartaViewsCount}
          hint="Registros en carta_views"
        />
        <StatCard label="Platos en carta" value={stats.menuItemsCount} />
        <StatCard
          label="Platos disponibles"
          value={stats.availableMenuItemsCount}
        />
      </section>

      {stats.cartaViewsCount === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">
            Aún no hay visitas. Comparte el QR de tu carta para empezar a ver
            datos aquí.
          </p>
        </section>
      ) : null}
    </div>
  );
}
