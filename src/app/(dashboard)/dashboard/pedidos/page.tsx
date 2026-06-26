import type { Metadata } from "next";
import Link from "next/link";
import { PedidosLiveView } from "@/components/dashboard/pedidos-live-view";
import { getOwnerRestaurant } from "@/lib/data/queries";
import { getOwnerOrders } from "@/lib/data/table-queries";

export const metadata: Metadata = {
  title: "Pedidos | Carta",
};

export default async function PedidosPage() {
  const restaurant = await getOwnerRestaurant();

  if (!restaurant) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Pedidos</h1>
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

  const orders = await getOwnerOrders();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Pedidos por mesa</h1>
        <p className="mt-2 text-slate-600">
          Pedidos enviados desde la carta con QR de mesa. Se actualizan en tiempo
          real cuando un comensal hace un pedido.
        </p>
        <PedidosLiveView
          restaurantId={restaurant.id}
          initialOrders={orders}
        />
      </section>
    </div>
  );
}
