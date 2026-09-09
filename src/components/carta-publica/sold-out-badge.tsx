import type { RestaurantThemeRow } from "@/lib/types";

type SoldOutBadgeProps = {
  theme: RestaurantThemeRow;
  className?: string;
};

export function SoldOutBadge({ theme, className }: SoldOutBadgeProps) {
  return (
    <span
      className={
        className ??
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
      }
      style={{
        backgroundColor: "var(--badge-unavailable-bg)",
        color: "var(--badge-unavailable-text)",
      }}
    >
      {theme.badge_unavailable_label || "Agotado"}
    </span>
  );
}
