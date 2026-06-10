"use client";

import { cn } from "@/lib/utils";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

export function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <label className="flex-1 text-sm text-slate-800">{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-8 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5"
      />
    </div>
  );
}

export function TextRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm text-slate-800">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      />
    </div>
  );
}

export function SelectRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <label className="flex-1 text-sm text-slate-800">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
          checked ? "bg-emerald-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </button>
      <span className="text-sm text-slate-800">{label}</span>
    </div>
  );
}

export function RangeRow({
  label,
  value,
  onChange,
  min = 0,
  max = 80,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <label className="flex-1 text-sm text-slate-800">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="max-w-24"
      />
      <span className="min-w-8 text-right text-xs text-slate-500">{value}%</span>
    </div>
  );
}

export function Divider() {
  return <div className="my-3 h-px bg-slate-200" />;
}
