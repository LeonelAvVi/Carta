import type { PublicCartaSections } from "@/lib/data/public-carta";
import type { RestaurantThemeRow } from "@/lib/types";
import { CartaCategoryNav } from "@/components/carta-publica/carta-category-nav";
import { CartaCategorySection } from "@/components/carta-publica/carta-category-section";

type CartaMenuProps = {
  sections: PublicCartaSections;
  theme: RestaurantThemeRow;
};

export function CartaMenu({ sections, theme }: CartaMenuProps) {
  const { favorites, categories, allNavCategories } = sections;

  if (allNavCategories.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p style={{ color: "var(--item-desc-color)" }}>
          Este restaurante aún no tiene productos disponibles en la carta.
        </p>
      </div>
    );
  }

  return (
    <>
      <CartaCategoryNav categories={allNavCategories} />

      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
        {favorites.length > 0 ? (
          <div className="flex flex-col gap-4">
            <h2
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--item-desc-color)" }}
            >
              Destacados
            </h2>
            {favorites.map((category) => (
              <CartaCategorySection
                key={category.id}
                category={category}
                theme={theme}
                highlighted
              />
            ))}
          </div>
        ) : null}

        {categories.length > 0 ? (
          <div className="flex flex-col gap-4">
            {favorites.length > 0 ? (
              <h2
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: "var(--item-desc-color)" }}
              >
                Menú
              </h2>
            ) : null}
            {categories.map((category) => (
              <CartaCategorySection key={category.id} category={category} theme={theme} />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
