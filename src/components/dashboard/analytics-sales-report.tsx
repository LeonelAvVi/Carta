import { StatCard } from "@/components/dashboard/stat-card";
import { formatPeriodLabel } from "@/lib/validations/analytics";
import type { PeriodSalesReport } from "@/lib/types";
import { formatPriceBs } from "@/lib/utils";

type AnalyticsSalesReportProps = {
  year: number;
  month: number;
  report: PeriodSalesReport;
};

export function AnalyticsSalesReport({
  year,
  month,
  report,
}: AnalyticsSalesReportProps) {
  const maxQuantity = Math.max(
    ...report.products.map((product) => product.total_quantity),
    1
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Resultados · {formatPeriodLabel(year, month)}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Solo pedidos marcados como entregados en este periodo.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Ingresos del periodo"
          value={formatPriceBs(report.total_revenue)}
          hint="Total de pedidos entregados"
        />
        <StatCard
          label="Pedidos entregados"
          value={report.order_count}
          hint="Cantidad de órdenes completadas"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-base font-semibold text-slate-900">
          Top 10 productos más vendidos
        </h3>
        <p className="mt-1 text-sm text-slate-500">Por unidades vendidas</p>

        <ul className="mt-6 flex flex-col gap-5">
          {report.products.map((product, index) => (
            <li key={product.menu_item_id}>
              <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="mr-2 font-semibold text-slate-400">
                    {index + 1}.
                  </span>
                  <span className="font-medium text-slate-900">{product.name}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums text-slate-900">
                    {product.total_quantity} uds.
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatPriceBs(product.total_revenue)}
                  </p>
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{
                    width: `${(product.total_quantity / maxQuantity) * 100}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
