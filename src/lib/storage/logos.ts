import type { SupabaseClient } from "@supabase/supabase-js";

export const LOGO_BUCKET = "logos";
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

const LOGO_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function getLogoStoragePath(
  userId: string,
  restaurantId: string,
  mimeType: string
): string {
  const ext = EXT_BY_MIME[mimeType] ?? "jpg";
  return `${userId}/${restaurantId}/logo.${ext}`;
}

export function getLogoPublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return path;
  return `${base}/storage/v1/object/public/${LOGO_BUCKET}/${path}`;
}

export function validateLogoFile(file: File): string | null {
  if (!LOGO_ALLOWED_TYPES.has(file.type)) {
    return "Formato no válido. Usa JPG, PNG, WebP o GIF";
  }

  if (file.size > LOGO_MAX_BYTES) {
    return "El logo debe pesar menos de 2 MB";
  }

  if (file.size === 0) {
    return "El archivo está vacío";
  }

  return null;
}

export async function uploadRestaurantLogo(
  supabase: SupabaseClient,
  userId: string,
  restaurantId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const validationError = validateLogoFile(file);
  if (validationError) {
    return { url: null, error: validationError };
  }

  const path = getLogoStoragePath(userId, restaurantId, file.type);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("uploadRestaurantLogo:", uploadError.message);
    return { url: null, error: "No se pudo subir el logo. Intenta de nuevo." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);

  return { url: publicUrl, error: null };
}

export async function deleteRestaurantLogo(
  supabase: SupabaseClient,
  userId: string,
  logoUrl: string | null
): Promise<void> {
  if (!logoUrl) return;

  const marker = `/storage/v1/object/public/${LOGO_BUCKET}/`;
  const index = logoUrl.indexOf(marker);
  if (index === -1) return;

  const path = logoUrl.slice(index + marker.length);
  if (!path.startsWith(`${userId}/`)) return;

  const { error } = await supabase.storage.from(LOGO_BUCKET).remove([path]);
  if (error) {
    console.error("deleteRestaurantLogo:", error.message);
  }
}
