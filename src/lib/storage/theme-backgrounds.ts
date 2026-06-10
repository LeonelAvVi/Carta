import type { SupabaseClient } from "@supabase/supabase-js";

export const THEME_BACKGROUNDS_BUCKET = "theme-backgrounds";
export const THEME_BG_MAX_BYTES = 3 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getThemeBackgroundPath(
  userId: string,
  restaurantId: string,
  zone: "header" | "body",
  mimeType: string
): string {
  const ext = EXT_BY_MIME[mimeType] ?? "jpg";
  return `${userId}/${restaurantId}/${zone}.${ext}`;
}

export function validateThemeBackgroundFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Formato no válido. Usa JPG, PNG o WebP";
  }
  if (file.size > THEME_BG_MAX_BYTES) {
    return "La imagen debe pesar menos de 3 MB";
  }
  if (file.size === 0) {
    return "El archivo está vacío";
  }
  return null;
}

export async function uploadThemeBackground(
  supabase: SupabaseClient,
  userId: string,
  restaurantId: string,
  zone: "header" | "body",
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const validationError = validateThemeBackgroundFile(file);
  if (validationError) {
    return { url: null, error: validationError };
  }

  const path = getThemeBackgroundPath(userId, restaurantId, zone, file.type);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(THEME_BACKGROUNDS_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("uploadThemeBackground:", uploadError.message);
    return { url: null, error: "No se pudo subir la imagen de fondo." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(THEME_BACKGROUNDS_BUCKET).getPublicUrl(path);

  return { url: publicUrl, error: null };
}

export async function deleteThemeBackground(
  supabase: SupabaseClient,
  userId: string,
  imageUrl: string | null
): Promise<void> {
  if (!imageUrl) return;

  const marker = `/storage/v1/object/public/${THEME_BACKGROUNDS_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const path = imageUrl.slice(index + marker.length);
  if (!path.startsWith(`${userId}/`)) return;

  const { error } = await supabase.storage
    .from(THEME_BACKGROUNDS_BUCKET)
    .remove([path]);

  if (error) {
    console.error("deleteThemeBackground:", error.message);
  }
}
