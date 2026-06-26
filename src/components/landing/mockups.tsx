export function CartaMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border-8 border-slate-900 bg-slate-900 shadow-2xl shadow-slate-900/20"
      aria-hidden
    >
      <div className="bg-gradient-to-b from-amber-50 to-white px-4 pb-6 pt-10">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-amber-200/80" />
        <div className="mx-auto h-3 w-32 rounded-full bg-slate-800/90" />
        <div className="mx-auto mt-2 h-2 w-24 rounded-full bg-slate-400/60" />
        <div className="mt-6 flex gap-2 overflow-hidden">
          {["Entradas", "Bebidas", "Postres"].map((tab) => (
            <div
              key={tab}
              className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-medium text-white first:bg-amber-500"
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex gap-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-24 rounded bg-slate-800/80" />
                  <div className="h-2 w-full rounded bg-slate-200" />
                  <div className="h-2.5 w-16 rounded bg-amber-500/80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="ml-4 h-2 w-32 rounded bg-slate-200" />
      </div>
      <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center rounded-xl border-2 text-xs font-semibold ${
              i < 3
                ? "border-amber-400/60 bg-amber-50 text-amber-700 shadow-[0_0_16px_rgba(251,191,36,0.25)]"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            M{i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
