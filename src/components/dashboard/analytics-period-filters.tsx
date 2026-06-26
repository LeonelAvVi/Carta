"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  getYearOptions,
  MONTH_OPTIONS,
} from "@/lib/validations/analytics";

type AnalyticsPeriodFiltersProps = {
  initialYear?: number;
  initialMonth?: number;
};

export function AnalyticsPeriodFilters({
  initialYear,
  initialMonth,
}: AnalyticsPeriodFiltersProps) {
  const router = useRouter();
  const yearOptions = getYearOptions();
  const currentYear = yearOptions[0] ?? new Date().getFullYear();

  const [year, setYear] = useState(
    initialYear ? String(initialYear) : String(currentYear)
  );
  const [month, setMonth] = useState(
    initialMonth ? String(initialMonth) : String(new Date().getMonth() + 1)
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({
      year,
      month,
    });
    router.push(`/dashboard/analytics?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="min-w-[10rem] flex-1">
        <label htmlFor="analytics-year" className="mb-1.5 block text-sm font-medium text-slate-700">
          Año
        </label>
        <select
          id="analytics-year"
          name="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[10rem] flex-1">
        <label htmlFor="analytics-month" className="mb-1.5 block text-sm font-medium text-slate-700">
          Mes
        </label>
        <select
          id="analytics-month"
          name="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          {MONTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Consultar estadísticas
      </button>
    </form>
  );
}
