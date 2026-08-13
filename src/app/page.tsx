import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tu QaRta — El menú inteligente",
  description:
    "La nueva forma de mostrar tu menú. Carta digital, pedidos por mesa y analytics. Más que un QR — hecho para restaurantes en Bolivia.",
  openGraph: {
    title: "Tu QaRta — El menú inteligente",
    description:
      "Convierte cada mesa en una experiencia. Menú digital, pedidos en vivo y gestión inteligente.",
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
