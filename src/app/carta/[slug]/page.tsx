import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CartaTemplateRenderer } from "@/components/carta-publica/carta-template-renderer";
import { CartaThemeRoot } from "@/components/carta-publica/carta-theme-root";
import { getRestaurantTheme } from "@/lib/data/theme-queries";
import {
  getPublicCategoriesWithProducts,
  getRestaurantBySlug,
  recordCartaView,
  splitPublicCartaCategories,
} from "@/lib/data/public-carta";

type CartaPublicPageProps = {
  params: { slug: string };
  searchParams?: { preview?: string };
};

export async function generateMetadata({
  params,
}: CartaPublicPageProps): Promise<Metadata> {
  const { slug } = params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return {
      title: "Carta no encontrada",
    };
  }

  return {
    title: `${restaurant.name} · Carta`,
    description:
      restaurant.description ?? `Carta digital de ${restaurant.name}. Consulta nuestro menú.`,
    openGraph: {
      title: `${restaurant.name} · Carta`,
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
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
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
      <CartaTemplateRenderer restaurant={restaurant} sections={sections} />
    </CartaThemeRoot>
  );
}
