export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatPriceBs(price: number | null | undefined): string {
  if (price === null || price === undefined) return "—";
  return `Bs. ${Number(price).toFixed(2)}`;
}
