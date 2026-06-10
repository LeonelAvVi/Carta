import type { PublicCartaSections } from "@/lib/data/public-carta";
import type { RestaurantRow, RestaurantThemeRow } from "@/lib/types";

export type CartaTemplateProps = {
  restaurant: RestaurantRow;
  theme: RestaurantThemeRow;
  sections: PublicCartaSections;
};
