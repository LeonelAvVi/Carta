/**
 * Contacto y presencia pública de la plataforma Tu QaRta.
 * WhatsApp puede sobreescribirse con NEXT_PUBLIC_CONTACT_WHATSAPP en Vercel.
 */

export const BRAND_NAME = "Tu QaRta";
export const BRAND_DOMAIN = "tuqarta.app";
export const BRAND_SITE_URL = `https://${BRAND_DOMAIN}`;

/** Formato internacional sin + (wa.me). */
export const BRAND_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.replace(/\D/g, "") ||
  "59157951232";

export const BRAND_SOCIAL = {
  instagram: "https://www.instagram.com/tuqartabolivia",
  tiktok: "https://www.tiktok.com/@tu.qarta.bolivia",
} as const;

export function brandWhatsAppHref(message?: string): string {
  const base = `https://wa.me/${BRAND_WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
