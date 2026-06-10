import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  getCurrentProfile,
  getDashboardStats,
  getOwnerRestaurant,
  getPublicCartaUrl,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Panel | Carta",
};

export default async function DashboardPage() {
  const [profile, restaurant] = await Promise.all([
    getCurrentProfile(),
    getOwnerRestaurant(),
  ]);

  const stats = await getDashboardStats(restaurant?.id ?? null);

  const quickLinks = [
    {
      href: "/dashboard/restaurante",
      title: restaurant ? "Editar restaurante" : "Configurar restaurante",
      description: restaurant
        ? `${restaurant.name} · ${restaurant.slug}`
        : "Nombre, descripción, logo y color",
    },
    {
      href: "/dashboard/carta",
      title: "Armar la carta",
      description: `${stats.categoriesCount} categorías · ${stats.menuItemsCount} platos`,
    },
    {
      href: "/dashboard/analytics",
      title: "Ver analytics",
      description: `${stats.cartaViewsCount} visitas registradas`,
    },
    {
      href: "/dashboard/cuenta",
      title: "Plan y cuenta",
      description: "Suscripción y límites",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Panel</h1>
        <p className="mt-2 text-slate-600">
          Hola,{" "}
          <span className="font-medium text-slate-900">
            {profile?.full_name ?? profile?.email ?? "Usuario"}
          </span>
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">Siguiente paso</p>
          <p className="mt-1 text-sm text-slate-600">
            {restaurant
              ? "Agrega categorías y platos en Carta para publicar tu menú."
              : "Crea tu restaurante para empezar a armar la carta digital."}
          </p>
          {restaurant ? (
            <p className="mt-3 text-sm">
              <span className="text-slate-600">Carta pública: </span>
              <a
                href={getPublicCartaUrl(restaurant.slug)}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                {getPublicCartaUrl(restaurant.slug)}
              </a>
            </p>
          ) : null}
        </div>
      </section>

      {restaurant ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Categorías" value={stats.categoriesCount} />
          <StatCard label="Platos" value={stats.menuItemsCount} />
          <StatCard
            label="Disponibles"
            value={stats.availableMenuItemsCount}
            hint="Platos visibles en la carta"
          />
          <StatCard label="Visitas" value={stats.cartaViewsCount} />
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <p className="text-base font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
