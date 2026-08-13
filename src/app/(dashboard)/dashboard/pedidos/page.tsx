import type { Metadata } from "next";
import Link from "next/link";
import { PedidosLiveView } from "@/components/dashboard/pedidos-live-view";
import { getOwnerRestaurant } from "@/lib/data/queries";
import { getOwnerOrders } from "@/lib/data/table-queries";
import { ORDER_STATUS_LABELS } from "@/lib/validations/order";

export const metadata: Metadata = {
  title: "Pedidos | Carta",
};

const ORDER_FLOW = [
  {
    key: "pending" as const,
    hint: "El comensal envió el pedido desde la carta",
    badge: "bg-amber-500",
    card: "border-amber-200 bg-amber-50",
    title: "text-amber-900",
    hintClass: "text-amber-800/70",
  },
  {
    key: "confirmed" as const,
    hint: "El local aceptó el pedido",
    badge: "bg-sky-500",
    card: "border-sky-200 bg-sky-50",
    title: "text-sky-900",
    hintClass: "text-sky-800/70",
  },
  {
    key: "preparing" as const,
    hint: "Cocina o barra lo está preparando",
    badge: "bg-brand-purple",
    card: "border-brand-purple/25 bg-[#F0ECFF]",
    title: "text-brand-purple",
    hintClass: "text-brand-purple/70",
  },
  {
    key: "ready" as const,
    hint: "Listo para llevar a la mesa o entregar",
    badge: "bg-orange-500",
    card: "border-orange-200 bg-orange-50",
    title: "text-orange-900",
    hintClass: "text-orange-800/70",
  },
  {
    key: "delivered" as const,
    hint: "Ya se sirvió al cliente",
    badge: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-900",
    hintClass: "text-emerald-800/70",
  },
];

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

        <div className="mt-5 rounded-xl border border-brand-purple/10 bg-[#F7F5FF] p-4">
          <p className="text-sm font-semibold text-brand">Estados del pedido</p>
          <p className="mt-1 text-xs text-slate-600">
            Del ingreso hasta que se sirve al cliente:
          </p>
          <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {ORDER_FLOW.map((step, index) => (
              <li
                key={step.key}
                className={`relative flex gap-3 rounded-lg border px-3 py-3 ${step.card}`}
              >
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${step.badge}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${step.title}`}>
                    {ORDER_STATUS_LABELS[step.key]}
                  </p>
                  <p className={`mt-0.5 text-[10px] leading-snug ${step.hintClass}`}>
                    {step.hint}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[10px] text-slate-500">
            También puede marcarse como{" "}
            <span className="rounded bg-rose-100 px-1.5 py-0.5 font-medium text-rose-700">
              {ORDER_STATUS_LABELS.cancelled}
            </span>{" "}
            si el pedido no se continúa.
          </p>
        </div>

        <div className="mt-6">
          <PedidosLiveView
            restaurantId={restaurant.id}
            initialOrders={orders}
          />
        </div>
      </section>
    </div>
  );
}
