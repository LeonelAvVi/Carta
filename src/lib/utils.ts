export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatPriceBs(price: number | null | undefined): string {
  if (price === null || price === undefined) return "—";
  return `Bs. ${Number(price).toFixed(2)}`;
}

/** Fecha/hora en es-BO; normaliza espacios Unicode para evitar errores de hidratación SSR. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";

  const formatted = new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/La_Paz",
  }).format(new Date(iso));

  return formatted.replace(/[\u202f\u00a0]/g, " ");
}
