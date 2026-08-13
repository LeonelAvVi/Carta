import type { Metadata } from "next";
import Image from "next/image";
import { RestaurantForm } from "@/components/dashboard/restaurant-form";
import { getRequestAppBaseUrl } from "@/lib/carta/request-app-url";
import { getOwnerRestaurant, getPublicCartaUrl } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Restaurante | Carta",
};

export default async function RestaurantePage() {
  const restaurant = await getOwnerRestaurant();
  const publicUrl = restaurant
    ? getPublicCartaUrl(restaurant.slug, getRequestAppBaseUrl())
    : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {restaurant?.logo_url ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200">
              <Image
                src={restaurant.logo_url}
                alt={`Logo de ${restaurant.name}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">Restaurante</h1>
            <p className="mt-2 text-slate-600">
              {restaurant
                ? "Edita el nombre, descripción y logo de tu negocio."
                : "Crea tu restaurante para empezar a usar Carta."}
            </p>
          </div>
        </div>

        {restaurant ? (
          <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Nombre</dt>
              <dd className="font-medium text-slate-900">{restaurant.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Estado</dt>
              <dd className="font-medium text-slate-900">
                {restaurant.is_active ? "Carta activa" : "Carta inactiva"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Descripción</dt>
              <dd className="font-medium text-slate-900">
                {restaurant.description ?? "Sin descripción"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Enlace público</dt>
              <dd className="mt-1 break-all font-medium text-slate-900">
                {publicUrl ? (
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    {publicUrl}
                  </a>
                ) : null}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {restaurant ? "Editar datos" : "Nuevo restaurante"}
        </h2>
        <div className="mt-6">
          <RestaurantForm restaurant={restaurant} />
        </div>
      </section>
    </div>
  );
}
