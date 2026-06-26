import type { Metadata } from "next";
import Link from "next/link";
import { TableManager } from "@/components/dashboard/table-manager";
import { getOwnerRestaurant } from "@/lib/data/queries";
import { getOwnerTables } from "@/lib/data/table-queries";

export const metadata: Metadata = {
  title: "Mesas | Carta",
};

export default async function MesasPage() {
  const restaurant = await getOwnerRestaurant();

  if (!restaurant) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Mesas</h1>
        <p className="mt-2 text-slate-600">
          Primero debes configurar tu restaurante.
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

  const tables = await getOwnerTables();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Mesas</h1>
        <p className="mt-2 text-slate-600">
          Cada mesa tiene su propio QR. Cuando el cliente escanea, puede armar un
          pedido vinculado a esa mesa.
        </p>
        <Link
          href="/dashboard/pedidos"
          className="mt-4 inline-flex text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
        >
          Ver pedidos entrantes →
        </Link>
      </section>

      <TableManager tables={tables} restaurant={restaurant} />
    </div>
  );
}
