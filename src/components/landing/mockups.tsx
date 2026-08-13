"use client";

import { useEffect, useState } from "react";
import { BrandLogo, BrandMark } from "@/components/landing/brand-logo";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Hamburguesa Clásica", price: "Bs. 45", tone: "bg-orange-100" },
  { name: "Ensalada Fresh", price: "Bs. 32", tone: "bg-emerald-100" },
  { name: "Café de especialidad", price: "Bs. 18", tone: "bg-amber-100" },
];

/**
 * Ciclo: QR → escaneo → cambio de pantalla → menú → blanco → repetir
 */
type Phase = "qr" | "scan" | "to-menu" | "menu" | "to-white";

const DURATIONS: Record<Phase, number> = {
  qr: 2200,
  scan: 1800,
  "to-menu": 900,
  menu: 3800,
  "to-white": 900,
};

const NEXT: Record<Phase, Phase> = {
  qr: "scan",
  scan: "to-menu",
  "to-menu": "menu",
  menu: "to-white",
  "to-white": "qr",
};

function QrBlock({ scanning }: { scanning: boolean }) {
  return (
    <div className="relative w-[132px]">
      <div className="rounded-2xl border-2 border-brand/90 bg-white p-3 shadow-md">
        <div className="relative overflow-hidden rounded-md">
          <svg viewBox="0 0 70 70" className="block h-[108px] w-full" aria-hidden>
            <rect x="4" y="4" width="18" height="18" rx="2" fill="#111827" />
            <rect x="8" y="8" width="10" height="10" rx="1" fill="#fff" />
            <rect x="11" y="11" width="4" height="4" fill="#111827" />
            <rect x="48" y="4" width="18" height="18" rx="2" fill="#111827" />
            <rect x="52" y="8" width="10" height="10" rx="1" fill="#fff" />
            <rect x="55" y="11" width="4" height="4" fill="#111827" />
            <rect x="4" y="48" width="18" height="18" rx="2" fill="#111827" />
            <rect x="8" y="52" width="10" height="10" rx="1" fill="#fff" />
            <rect x="11" y="55" width="4" height="4" fill="#111827" />
            <rect x="28" y="8" width="4" height="4" fill="#111827" />
            <rect x="36" y="8" width="4" height="4" fill="#111827" />
            <rect x="28" y="16" width="4" height="4" fill="#111827" />
            <rect x="40" y="16" width="4" height="4" fill="#111827" />
            <rect x="32" y="28" width="6" height="6" fill="#111827" />
            <rect x="28" y="38" width="4" height="4" fill="#111827" />
            <rect x="38" y="38" width="4" height="4" fill="#111827" />
            <rect x="44" y="32" width="4" height="4" fill="#111827" />
            <rect x="28" y="48" width="4" height="4" fill="#111827" />
            <rect x="36" y="52" width="4" height="4" fill="#111827" />
            <rect x="48" y="44" width="4" height="4" fill="#111827" />
            <rect x="56" y="52" width="4" height="4" fill="#111827" />
            <rect x="48" y="56" width="4" height="4" fill="#111827" />
            <rect x="8" y="28" width="4" height="4" fill="#111827" />
            <rect x="16" y="36" width="4" height="4" fill="#111827" />
          </svg>

          {scanning ? (
            <>
              <div className="absolute inset-0 bg-brand-purple/[0.07]" />
              <div className="absolute inset-x-0 h-[2px] bg-brand-purple shadow-[0_0_14px_3px_rgba(93,68,255,0.55)] motion-safe:animate-qr-scan-line" />
            </>
          ) : null}
        </div>
        <p className="mt-2 text-center text-[9px] font-semibold text-brand">
          Mesa 5 · Café Vienna
        </p>
      </div>
      <div className="mx-auto mt-1 h-2 w-14 rounded-b-md bg-brand" />
      <div className="mx-auto h-1 w-18 rounded-full bg-brand-purple" style={{ width: 72 }} />
    </div>
  );
}

function QrScreen({ scanning }: { scanning: boolean }) {
  return (
    <div className="flex h-full flex-col items-center bg-white px-4 pb-8 pt-10">
      <BrandLogo markClassName="!h-7 !w-7" />
      <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-purple">
        {scanning ? "Escaneando…" : "Escanea el QR de tu mesa"}
      </p>
      <p className="mt-1.5 max-w-[11.5rem] text-center text-[11px] leading-snug text-slate-500">
        Sin apps. El menú aparece al instante.
      </p>
      <div className="mt-8">
        <QrBlock scanning={scanning} />
      </div>
      <div className="mt-auto rounded-full bg-[#F4F2FF] px-3 py-1.5">
        <span className="text-[10px] font-medium text-brand-purple">
          {scanning ? "Abriendo carta…" : "QR listo en la mesa"}
        </span>
      </div>
    </div>
  );
}

function MenuScreen({ showItems }: { showItems: boolean }) {
  return (
    <div className="flex h-full flex-col bg-white px-4 pb-8 pt-8">
      <div className="mb-5 flex justify-center">
        <BrandLogo markClassName="!h-7 !w-7" />
      </div>
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-purple">
        Nuestro menú
      </p>
      <p className="mt-1 text-center text-[10px] text-slate-400">Café Vienna</p>

      <div className="mt-5 space-y-3">
        {menuItems.map((item, i) => (
          <div
            key={item.name}
            className={cn(
              "flex items-center gap-3 transition-all duration-700 ease-out",
              showItems
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            )}
            style={{
              transitionDelay: showItems ? `${140 + i * 130}ms` : "0ms",
            }}
          >
            <div className={`h-11 w-11 shrink-0 rounded-xl ${item.tone}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-brand">{item.name}</p>
              <p className="text-[11px] text-slate-500">{item.price}</p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-purple text-sm font-bold text-white">
              +
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div
          className={cn(
            "flex items-center justify-center gap-2 rounded-full border border-brand-line bg-white px-4 py-2.5 shadow-sm transition-all duration-700 ease-out",
            showItems ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}
          style={{ transitionDelay: showItems ? "520ms" : "0ms" }}
        >
          <BrandMark className="!h-5 !w-5" />
          <span className="text-xs font-semibold text-slate-700">Abre el menú</span>
        </div>
      </div>
    </div>
  );
}

/** Mock cíclico: QR → escaneo → cambio de pantalla → menú → blanco → repetir */
export function CartaMockup() {
  const [phase, setPhase] = useState<Phase>("qr");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPhase("menu");
      return;
    }
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(() => setPhase(NEXT[phase]), DURATIONS[phase]);
    return () => window.clearTimeout(id);
  }, [phase, enabled]);

  const showQr = phase === "qr" || phase === "scan";
  const showMenu = phase === "to-menu" || phase === "menu";
  const whiteOut = phase === "to-white";
  const scanning = phase === "scan";
  // Durante el cambio, el QR sale a la izquierda y el menú entra desde la derecha
  const swapping = phase === "to-menu";

  return (
    <div
      className="relative mx-auto h-[480px] w-[280px] shrink-0 overflow-hidden rounded-[2rem] border-[10px] border-brand bg-white shadow-2xl shadow-brand/25"
      aria-hidden
    >
      <div className="absolute left-1/2 top-0 z-30 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-brand" />

      {/* Pantalla QR */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          showQr && !swapping
            ? "z-10 translate-x-0 opacity-100"
            : swapping
              ? "z-10 -translate-x-[28%] opacity-0"
              : "z-0 translate-x-0 opacity-0"
        )}
      >
        <QrScreen scanning={scanning} />
      </div>

      {/* Pantalla menú */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          showMenu
            ? "z-10 translate-x-0 opacity-100"
            : "z-0 translate-x-[32%] opacity-0"
        )}
      >
        <MenuScreen showItems={phase === "menu"} />
      </div>

      {/* Fundido a blanco antes de reiniciar el ciclo */}
      <div
        className={cn(
          "absolute inset-0 z-20 bg-white transition-opacity duration-700 ease-in-out",
          whiteOut ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-brand-line bg-white shadow-xl shadow-brand/10"
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-brand-line bg-brand-soft px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="ml-4 h-2 w-28 rounded bg-brand-line" />
      </div>
      <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center rounded-xl border-2 text-xs font-semibold ${
              i < 3
                ? "border-brand-purple/50 bg-[#5D44FF]/10 text-brand-purple shadow-[0_0_16px_rgba(93,68,255,0.2)]"
                : "border-brand-line bg-brand-soft text-slate-500"
            }`}
          >
            M{i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
