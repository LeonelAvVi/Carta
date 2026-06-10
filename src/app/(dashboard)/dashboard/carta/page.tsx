import type { Metadata } from "next";
import Link from "next/link";
import { CategoryManager } from "@/components/dashboard/category-manager";
import {
  getCategoriesWithProducts,
  getOwnerRestaurant,
  getPublicCartaUrl,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Carta | Carta",
};

export default async function CartaPage() {
  const restaurant = await getOwnerRestaurant();

  if (!restaurant) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Carta</h1>
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

  const categories = await getCategoriesWithProducts(restaurant.id);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Carta · {restaurant.name}
            </h1>
            <p className="mt-2 text-slate-600">
              Organiza categorías y productos. Marca favoritas para destacarlas en la
              carta (Postres, Bebidas, etc.).
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link
              href="/dashboard/apariencia"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Elegir plantilla
            </Link>
            <a
              href={getPublicCartaUrl(restaurant.slug)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Ver carta pública
            </a>
          </div>
        </div>
      </section>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
