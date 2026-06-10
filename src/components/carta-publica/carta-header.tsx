import Image from "next/image";
import type { RestaurantRow, RestaurantThemeRow } from "@/lib/types";

type CartaHeaderProps = {
  restaurant: RestaurantRow;
  theme: RestaurantThemeRow;
};

export function CartaHeader({ restaurant, theme }: CartaHeaderProps) {
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
    <header className="border-b border-[color:var(--category-container-border)]" style={headerStyle}>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-8 text-center">
        {restaurant.logo_url ? (
          <div
            className="relative h-20 w-20 overflow-hidden rounded-full bg-white shadow-sm"
            style={{ border: "2px solid var(--logo-border-color)" }}
          >
            <Image
              src={restaurant.logo_url}
              alt={`Logo de ${restaurant.name}`}
              fill
              sizes="80px"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white font-display"
            style={{
              backgroundColor: "var(--tab-active-bg)",
              border: "2px solid var(--logo-border-color)",
            }}
            aria-hidden
          >
            {restaurant.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h1
            className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--header-name-color)" }}
          >
            {restaurant.name}
          </h1>
          {restaurant.description ? (
            <p
              className="text-pretty text-sm leading-relaxed sm:text-base"
              style={{ color: "var(--header-desc-color)" }}
            >
              {restaurant.description}
            </p>
          ) : null}
          {theme.show_hours ? (
            <p className="text-xs sm:text-sm" style={{ color: "var(--hours-color)" }}>
              <span aria-hidden className="mr-1">
                🕐
              </span>
              {theme.hours_text}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
