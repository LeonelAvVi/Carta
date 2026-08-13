export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando sección…</span>

      <div className="relative overflow-hidden rounded-2xl border border-brand-purple/10 bg-white p-8 shadow-sm shadow-brand-purple/5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-brand-purple/20" />
        <div className="mt-4 h-7 w-40 animate-pulse rounded-lg bg-slate-200/80" />
        <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded-md bg-slate-100" />
        <div className="mt-6 h-24 animate-pulse rounded-xl bg-[#F4F2FF]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200/80" />
            <div className="mt-3 h-8 w-14 animate-pulse rounded bg-brand-purple/15" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm"
          >
            <div className="h-4 w-36 animate-pulse rounded bg-slate-200/80" />
            <div className="mt-2 h-3 w-48 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
