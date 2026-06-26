import { z } from "zod";

const currentYear = new Date().getFullYear();

export const analyticsPeriodSchema = z.object({
  year: z.coerce
    .number()
    .int("Año no válido")
    .min(2025, "Año no válido")
    .max(currentYear, "No puedes consultar un año futuro"),
  month: z.coerce
    .number()
    .int("Mes no válido")
    .min(1, "Mes no válido")
    .max(12, "Mes no válido"),
});

export type AnalyticsPeriodInput = z.infer<typeof analyticsPeriodSchema>;

export const MONTH_OPTIONS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
] as const;

export function getYearOptions(): number[] {
  const minYear = 2025;
  const years: number[] = [];
  for (let year = currentYear; year >= minYear; year -= 1) {
    years.push(year);
  }
  return years;
}

export function formatPeriodLabel(year: number, month: number): string {
  const monthLabel = MONTH_OPTIONS.find((m) => m.value === month)?.label ?? String(month);
  return `${monthLabel} ${year}`;
}
