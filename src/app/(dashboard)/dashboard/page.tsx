import type { Metadata } from "next";
import Link from "next/link";
import { DashboardQrSection } from "@/components/dashboard/dashboard-qr-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { getRequestAppBaseUrl } from "@/lib/carta/request-app-url";
import { getDeliveryCartaUrl } from "@/lib/carta/table-urls";
import {
  getCurrentProfile,
  getDashboardStats,
  getOwnerRestaurant,
  getPublicCartaUrl,
} from "@/lib/data/queries";
import {
  ensureDeliveryTable,
  getOwnerTables,
} from "@/lib/data/table-queries";

export const metadata: Metadata = {
  title: "Panel",
};

export default async function DashboardPage() {
  const [profile, restaurant] = await Promise.all([
    getCurrentProfile(),
    getOwnerRestaurant(),
  ]);

  const stats = await getDashboardStats(restaurant?.id ?? null);
  const appBaseUrl = getRequestAppBaseUrl();

  const [tables] = restaurant
    ? await Promise.all([
        getOwnerTables(),
        ensureDeliveryTable(restaurant.id),
      ])
    : [[] as Awaited<ReturnType<typeof getOwnerTables>>];

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
      <section className="relative overflow-hidden rounded-2xl border border-brand-purple/10 bg-white p-8 shadow-sm shadow-brand-purple/5">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-purple/15 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-purple">
            Tu QaRta
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand">Panel</h1>
          <p className="mt-2 text-slate-600">
            Hola,{" "}
            <span className="font-semibold text-brand">
              {profile?.full_name ?? profile?.email ?? "Usuario"}
            </span>
          </p>

          <div className="mt-6 rounded-xl border border-brand-purple/10 bg-[#F4F2FF] p-4">
            <p className="text-sm font-semibold text-brand">Siguiente paso</p>
            <p className="mt-1 text-sm text-slate-600">
              {restaurant
                ? "Agrega categorías y platos en Carta para publicar tu menú."
                : "Crea tu restaurante para empezar a armar la carta digital."}
            </p>
            {restaurant ? (
              <p className="mt-3 text-sm">
                <span className="text-slate-600">Carta pública: </span>
                <a
                  href={getPublicCartaUrl(restaurant.slug, appBaseUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-purple underline-offset-4 hover:underline"
                >
                  {getPublicCartaUrl(restaurant.slug, appBaseUrl)}
                </a>
              </p>
            ) : null}
          </div>
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
            className="rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm shadow-brand-purple/5 transition-colors hover:border-brand-purple/25 hover:bg-[#F7F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
          >
            <p className="text-base font-semibold text-brand">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </section>

      {restaurant ? (
        <DashboardQrSection
          restaurantSlug={restaurant.slug}
          restaurantName={restaurant.name}
          tables={tables}
          generalUrl={getPublicCartaUrl(restaurant.slug, appBaseUrl)}
          deliveryUrl={getDeliveryCartaUrl(restaurant.slug, appBaseUrl)}
          appBaseUrl={appBaseUrl}
        />
      ) : null}
    </div>
  );
}
