import type { Metadata } from "next";
import Link from "next/link";
import { ThemeCustomizer } from "@/components/dashboard/theme-customizer";
import { getOwnerRestaurant } from "@/lib/data/queries";
import { getRestaurantTheme } from "@/lib/data/theme-queries";

export const metadata: Metadata = {
  title: "Apariencia | Carta",
};

export default async function AparienciaPage() {
  const restaurant = await getOwnerRestaurant();

  if (!restaurant) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Apariencia</h1>
        <p className="mt-2 text-slate-600">
          Primero debes configurar tu restaurante.
        </p>
        <Link
          href="/dashboard/restaurante"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Ir a Restaurante
        </Link>
      </section>
    );
  }

  const theme = await getRestaurantTheme(restaurant.id);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Apariencia de la carta</h1>
        <p className="mt-2 text-slate-600">
          Personaliza colores, tipografía y pie de página. Los cambios se ven al
          instante en la preview; pulsa Guardar para publicarlos.
        </p>
      </section>

      <ThemeCustomizer initialTheme={theme} slug={restaurant.slug} />
    </div>
  );
}
