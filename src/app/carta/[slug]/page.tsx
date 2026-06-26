import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CartaCartProvider } from "@/components/carta-publica/carta-cart-provider";
import { CartaOrderingShell } from "@/components/carta-publica/carta-ordering-shell";
import { CartaTemplateRenderer } from "@/components/carta-publica/carta-template-renderer";
import { CartaThemeRoot } from "@/components/carta-publica/carta-theme-root";
import { getTableBySlug } from "@/lib/data/table-queries";
import { getRestaurantTheme } from "@/lib/data/theme-queries";
import {
  getPublicCategoriesWithProducts,
  getRestaurantBySlug,
  recordCartaView,
  splitPublicCartaCategories,
} from "@/lib/data/public-carta";
import type { TableContext } from "@/lib/types";

type CartaPublicPageProps = {
  params: { slug: string };
  searchParams?: { preview?: string; table?: string };
};

export async function generateMetadata({
  params,
  searchParams,
}: CartaPublicPageProps): Promise<Metadata> {
  const { slug } = params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return {
      title: "Carta no encontrada",
    };
  }

  const tableSlug = searchParams?.table;
  const table = tableSlug
    ? await getTableBySlug(restaurant.id, tableSlug)
    : null;

  const titleSuffix = table ? ` · ${table.name}` : "";

  return {
    title: `${restaurant.name}${titleSuffix} · Carta`,
    description:
      restaurant.description ?? `Carta digital de ${restaurant.name}. Consulta nuestro menú.`,
    openGraph: {
      title: `${restaurant.name}${titleSuffix} · Carta`,
      description:
        restaurant.description ?? `Carta digital de ${restaurant.name}. Consulta nuestro menú.`,
      ...(restaurant.logo_url ? { images: [{ url: restaurant.logo_url }] } : {}),
    },
  };
}

export default async function CartaPublicPage({
  params,
  searchParams,
}: CartaPublicPageProps) {
  const { slug } = params;
  const isPreview = searchParams?.preview === "true";
  const tableSlug = searchParams?.table?.trim();

  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  let tableContext: TableContext | null = null;
  if (tableSlug) {
    const table = await getTableBySlug(restaurant.id, tableSlug);
    if (table) {
      tableContext = {
        id: table.id,
        name: table.name,
        slug: table.slug,
        restaurant_id: table.restaurant_id,
      };
    }
  }

  const [theme, categories] = await Promise.all([
    getRestaurantTheme(restaurant.id),
    getPublicCategoriesWithProducts(restaurant.id),
  ]);

  if (!isPreview) {
    await recordCartaView(restaurant.id, headers().get("user-agent"));
  }

  const sections = splitPublicCartaCategories(categories);

  return (
    <CartaThemeRoot theme={theme} previewMode={isPreview}>
      <CartaCartProvider restaurantId={restaurant.id} table={tableContext}>
        <CartaOrderingShell>
          <CartaTemplateRenderer restaurant={restaurant} sections={sections} />
        </CartaOrderingShell>
      </CartaCartProvider>
    </CartaThemeRoot>
  );
}
