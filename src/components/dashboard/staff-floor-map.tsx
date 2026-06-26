"use client";

import { cn } from "@/lib/utils";
import type { TableRow } from "@/lib/types";

type StaffFloorMapProps = {
  tables: TableRow[];
  occupiedTableIds: Set<string>;
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
};

export function StaffFloorMap({
  tables,
  occupiedTableIds,
  selectedTableId,
  onSelectTable,
}: StaffFloorMapProps) {
  if (tables.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-600 bg-slate-900/40 p-12">
        <p className="text-center text-slate-400">
          No hay mesas activas. El dueño debe configurarlas en Mesas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-2xl border border-slate-700/60 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 p-8 shadow-inner">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-200">Mapa de mesas</h2>
        <div className="flex items-center gap-5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-md border border-slate-600 bg-slate-800" />
            Libre
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-md border border-amber-400/60 bg-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
            Ocupada
          </span>
        </div>
      </div>

      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        }}
      >
        {tables.map((table) => {
          const occupied = occupiedTableIds.has(table.id);
          const selected = selectedTableId === table.id;

          return (
            <button
              key={table.id}
              type="button"
              onClick={() => onSelectTable(table.id)}
              className={cn(
                "group relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 px-3 py-4 text-center transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                occupied
                  ? "border-amber-400/70 bg-amber-500/10 shadow-[0_0_24px_rgba(251,191,36,0.35)]"
                  : "border-slate-600/80 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800",
                selected && "ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900"
              )}
            >
              {occupied ? (
                <span
                  className="absolute right-3 top-3 h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                  aria-hidden
                />
              ) : null}

              <span
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  occupied ? "text-amber-300" : "text-slate-300"
                )}
              >
                {table.name}
              </span>
              <span
                className={cn(
                  "mt-2 text-xs font-medium uppercase tracking-wide",
                  occupied ? "text-amber-400/90" : "text-slate-500"
                )}
              >
                {occupied ? "Ocupada" : "Libre"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
