import type { Metadata } from "next";
import Link from "next/link";
import { EmployeeManager } from "@/components/dashboard/employee-manager";
import { requireOwnerAccess } from "@/lib/data/restaurant-access";
import { getRestaurantEmployees } from "@/lib/data/staff-queries";

export const metadata: Metadata = {
  title: "Equipo | Carta",
};

export default async function EquipoPage() {
  const access = await requireOwnerAccess();
  const employees = await getRestaurantEmployees(access.restaurantId);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Equipo</h1>
        <p className="mt-2 text-slate-600">
          Agregá personal de mostrador o barra para que vean el mapa de mesas y
          gestionen el estado de los pedidos en tiempo real.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Los empleados acceden desde{" "}
          <Link href="/dashboard/staff" className="font-medium text-slate-900 underline">
            /dashboard/staff
          </Link>{" "}
          con su cuenta.
        </p>
      </section>

      <EmployeeManager employees={employees} />
    </div>
  );
}
