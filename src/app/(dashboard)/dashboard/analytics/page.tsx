import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsPeriodFilters } from "@/components/dashboard/analytics-period-filters";
import { AnalyticsSalesReport } from "@/components/dashboard/analytics-sales-report";
import {
  getOwnerRestaurant,
  getPublicCartaUrl,
  getTopProductsByPeriod,
} from "@/lib/data/queries";
import { getRequestAppBaseUrl } from "@/lib/carta/request-app-url";
import { analyticsPeriodSchema } from "@/lib/validations/analytics";

export const metadata: Metadata = {
  title: "Analytics | Carta",
};

type AnalyticsPageProps = {
  searchParams?: { year?: string; month?: string };
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const restaurant = await getOwnerRestaurant();

  if (!restaurant) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="mt-2 text-slate-600">
          Configura tu restaurante para ver el rendimiento de tus ventas.
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

  const hasQuery = Boolean(searchParams?.year && searchParams?.month);
  const parsed = hasQuery
    ? analyticsPeriodSchema.safeParse({
        year: searchParams?.year,
        month: searchParams?.month,
      })
    : null;

  const report =
    parsed?.success
      ? await getTopProductsByPeriod(
          restaurant.id,
          parsed.data.year,
          parsed.data.month
        )
      : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="mt-2 text-slate-600">
          Ranking de productos y ventas de{" "}
          <span className="font-medium text-slate-900">{restaurant.name}</span>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Carta pública: {getPublicCartaUrl(restaurant.slug, getRequestAppBaseUrl())}
        </p>
      </section>

      <AnalyticsPeriodFilters
        initialYear={parsed?.success ? parsed.data.year : undefined}
        initialMonth={parsed?.success ? parsed.data.month : undefined}
      />

      {!hasQuery ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm text-slate-600">
            Seleccione un año y mes para ver el rendimiento de sus ventas.
          </p>
        </section>
      ) : null}

      {hasQuery && parsed && !parsed.success ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            {parsed.error.flatten().formErrors[0] ?? "Periodo no válido"}
          </p>
        </section>
      ) : null}

      {parsed?.success && report === null ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            No se pudieron cargar las estadísticas. Intenta de nuevo.
          </p>
        </section>
      ) : null}

      {parsed?.success && report && report.order_count === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm text-slate-600">
            No hubo ventas registradas en este periodo.
          </p>
        </section>
      ) : null}

      {parsed?.success && report && report.order_count > 0 ? (
        <AnalyticsSalesReport
          year={parsed.data.year}
          month={parsed.data.month}
          report={report}
        />
      ) : null}
    </div>
  );
}
