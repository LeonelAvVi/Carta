import type { CategoryWithProducts, RestaurantThemeRow } from "@/lib/types";
import { CartaMenuItem } from "@/components/carta-publica/carta-menu-item";

type CartaCategorySectionProps = {
  category: CategoryWithProducts;
  theme: RestaurantThemeRow;
  highlighted?: boolean;
};

export function CartaCategorySection({
  category,
  theme,
  highlighted = false,
}: CartaCategorySectionProps) {
  return (
    <section
      id={`cat-${category.id}`}
      className="scroll-mt-28 overflow-hidden p-4 sm:p-5"
      style={{
        borderRadius: "12px",
        backgroundColor: "var(--category-container-bg)",
        border: "0.5px solid var(--category-container-border)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        {highlighted ? (
          <span
            aria-hidden
            className="inline-flex h-6 items-center rounded-full px-2 text-xs font-medium"
            style={{
              backgroundColor: "var(--badge-featured-bg)",
              color: "var(--badge-featured-text)",
            }}
          >
            ★
          </span>
        ) : null}
        <h2
          className="font-display text-lg font-semibold"
          style={{ color: "var(--category-title-color)" }}
        >
          {category.name}
        </h2>
      </div>

      <div
        aria-hidden
        className="mb-4 h-0.5 w-6 rounded-full"
        style={{ backgroundColor: "var(--category-accent-color)" }}
      />

      <div>
        {category.menu_items.map((item) => (
          <CartaMenuItem key={item.id} item={item} theme={theme} />
        ))}
      </div>
    </section>
  );
}
