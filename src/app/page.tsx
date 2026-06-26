import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "TuCarta.bo — Menú QR y gestión de pedidos para restaurantes",
  description:
    "Digitaliza tu carta, recibe pedidos en tiempo real y analiza tus ventas. Solución ideal para restaurantes en Bolivia. Precios en bolivianos, sin app para el comensal.",
  openGraph: {
    title: "TuCarta.bo — Menú QR y gestión de pedidos",
    description:
      "Moderniza tu local con carta digital, pedidos por mesa y analytics. Hecho para Bolivia.",
    type: "website",
  },
};

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPage isAuthenticated={Boolean(user)} />;
}
