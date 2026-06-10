import Image from "next/image";
import type { RestaurantRow, RestaurantThemeRow } from "@/lib/types";

type CasualHeaderProps = {
  restaurant: RestaurantRow;
  theme: RestaurantThemeRow;
};

export function CasualHeader({ restaurant, theme }: CasualHeaderProps) {
  const hasBgImage = Boolean(theme.header_bg_image_url);

  const headerStyle: React.CSSProperties = hasBgImage
    ? {
        backgroundImage: `linear-gradient(var(--header-overlay-color), var(--header-overlay-color)), var(--header-bg-image)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: "var(--header-bg)",
      };

  return (
    <header
      className="flex items-center gap-3 border-b px-4 py-3.5"
      style={{
        ...headerStyle,
        borderColor: "var(--category-container-border)",
      }}
    >
      {restaurant.logo_url ? (
        <div
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl"
          style={{ border: "2px solid var(--logo-border-color)" }}
        >
          <Image
            src={restaurant.logo_url}
            alt={`Logo de ${restaurant.name}`}
            fill
            sizes="44px"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold font-display"
          style={{
            backgroundColor: "var(--item-image-placeholder-bg)",
            color: "var(--tab-active-bg)",
            border: "2px solid var(--logo-border-color)",
          }}
          aria-hidden
        >
          {restaurant.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-sm font-bold font-display"
          style={{ color: "var(--header-name-color)" }}
        >
          {restaurant.name}
        </h1>
        {restaurant.description ? (
          <p
            className="mt-0.5 line-clamp-2 text-[10px] leading-snug"
            style={{ color: "var(--header-desc-color)" }}
          >
            {restaurant.description}
          </p>
        ) : null}
        {theme.show_hours ? (
          <p className="mt-1 text-[10px]" style={{ color: "var(--hours-color)" }}>
            <span aria-hidden className="mr-0.5">
              ⏰
            </span>
            {theme.hours_text}
          </p>
        ) : null}
      </div>
    </header>
  );
}
