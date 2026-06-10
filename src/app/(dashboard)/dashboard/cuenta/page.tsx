import type { Metadata } from "next";
import Link from "next/link";
import {
  getCurrentProfile,
  getOwnerRestaurant,
  getRestaurantSubscription,
  PLAN_LABELS,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Cuenta | Carta",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function CuentaPage() {
  const [profile, restaurant] = await Promise.all([
    getCurrentProfile(),
    getOwnerRestaurant(),
  ]);

  const subscription = restaurant
    ? await getRestaurantSubscription(restaurant.id)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Cuenta</h1>
        <p className="mt-2 text-slate-600">Tu perfil y plan de suscripción</p>

        <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Nombre</dt>
            <dd className="font-medium text-slate-900">
              {profile?.full_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Correo</dt>
            <dd className="font-medium text-slate-900">
              {profile?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Miembro desde</dt>
            <dd className="font-medium text-slate-900">
              {profile ? formatDate(profile.created_at) : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Suscripción</h2>

        {!restaurant ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Crea tu restaurante para activar el plan trial de 14 días.
            </p>
            <Link
              href="/dashboard/restaurante"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              Configurar restaurante
            </Link>
          </>
        ) : subscription ? (
          <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Plan</dt>
              <dd className="font-medium text-slate-900">
                {PLAN_LABELS[subscription.plan]}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Estado</dt>
              <dd className="font-medium capitalize text-slate-900">
                {subscription.status === "active"
                  ? "Activo"
                  : subscription.status === "expired"
                    ? "Expirado"
                    : "Cancelado"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Fin de trial</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(subscription.trial_ends_at)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Restaurante</dt>
              <dd className="font-medium text-slate-900">{restaurant.name}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            No hay suscripción registrada para{" "}
            <span className="font-medium">{restaurant.name}</span>. Se creará
            automáticamente al guardar el restaurante si aún no existe.
          </p>
        )}
      </section>
    </div>
  );
}
