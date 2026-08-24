import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { BRAND_SITE_URL } from "@/lib/brand/contact";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND_SITE_URL),
  title: {
    default: "Tu QaRta",
    template: "%s | Tu QaRta",
  },
  description:
    "El menú inteligente. Carta digital y pedidos por QR para restaurantes en Bolivia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
