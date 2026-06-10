import Image from "next/image";
import type { RestaurantRow, RestaurantThemeRow } from "@/lib/types";

type AtrevidaHeaderProps = {
  restaurant: RestaurantRow;
  theme: RestaurantThemeRow;
};

export function AtrevidaHeader({ restaurant, theme }: AtrevidaHeaderProps) {
  return (
    <header style={{ backgroundColor: "var(--header-bg)" }}>
      <div
        className="relative flex h-16 items-center justify-center gap-2.5 px-3"
        style={{ backgroundColor: "var(--category-container-bg)" }}
      >
        <div
          aria-hidden
          className="absolute left-0 right-0 top-0 h-[3px]"
          style={{ backgroundColor: "var(--tab-active-bg)" }}
        />

        {restaurant.logo_url ? (
          <div
            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
            style={{
              backgroundColor: "var(--header-bg)",
              border: "2px solid var(--tab-active-bg)",
            }}
          >
            <Image
              src={restaurant.logo_url}
              alt={`Logo de ${restaurant.name}`}
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base"
            style={{
              backgroundColor: "var(--header-bg)",
              border: "2px solid var(--tab-active-bg)",
            }}
            aria-hidden
          >
            {restaurant.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 text-center">
          <h1
            className="truncate text-sm font-bold tracking-wide font-display"
            style={{ color: "var(--header-name-color)" }}
          >
            {restaurant.name}
          </h1>
          {restaurant.description ? (
            <p
              className="mt-0.5 truncate text-[8px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--tab-active-bg)" }}
            >
              {restaurant.description}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
