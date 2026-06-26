import type { Metadata } from "next";
import Link from "next/link";
import { StaffFloorLive } from "@/components/dashboard/staff-floor-live";
import { LogoutButton } from "@/components/shared/logout-button";
import { requireStaffAccess } from "@/lib/data/restaurant-access";
import { getRestaurantOrders, getRestaurantTables } from "@/lib/data/staff-queries";

export const metadata: Metadata = {
  title: "Mapa de mesas | Carta",
};

export default async function StaffPage() {
  const access = await requireStaffAccess();
  const [tables, orders] = await Promise.all([
    getRestaurantTables(access.restaurantId),
    getRestaurantOrders(access.restaurantId),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-6 lg:px-10 lg:py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          {access.role === "owner" ? (
            <Link
              href="/dashboard"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Volver al panel
            </Link>
          ) : (
            <p className="text-sm text-slate-500">TuCarta.bo · Modo empleado</p>
          )}
          <div className="[&_button]:border-slate-600 [&_button]:text-slate-300 [&_button]:hover:bg-slate-800">
            <LogoutButton />
          </div>
        </div>

        <div className="hidden min-[1024px]:block">
          <StaffFloorLive
            restaurant={access.restaurant}
            initialTables={tables}
            initialOrders={orders}
          />
        </div>

        <div className="flex min-h-[60vh] items-center justify-center min-[1024px]:hidden">
          <div className="max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-semibold text-white">Vista de mostrador</h2>
            <p className="mt-3 text-sm text-slate-400">
              Esta pantalla está optimizada para computadoras en el local. Abrí{" "}
              <span className="font-medium text-amber-300">/dashboard/staff</span>{" "}
              desde un monitor o laptop con pantalla amplia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
