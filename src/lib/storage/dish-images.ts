import type { SupabaseClient } from "@supabase/supabase-js";

export const DISH_IMAGES_BUCKET = "dish-images";
export const DISH_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
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

export function getDishImageStoragePath(
  userId: string,
  restaurantId: string,
  menuItemId: string,
  mimeType: string
): string {
  const ext = EXT_BY_MIME[mimeType] ?? "jpg";
  return `${userId}/${restaurantId}/${menuItemId}.${ext}`;
}

export function validateDishImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Formato no válido. Usa JPG, PNG, WebP o GIF";
  }

  if (file.size > DISH_IMAGE_MAX_BYTES) {
    return "La imagen debe pesar menos de 3 MB";
  }

  if (file.size === 0) {
    return "El archivo está vacío";
  }

  return null;
}

export async function uploadDishImage(
  supabase: SupabaseClient,
  userId: string,
  restaurantId: string,
  menuItemId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const validationError = validateDishImageFile(file);
  if (validationError) {
    return { url: null, error: validationError };
  }

  const path = getDishImageStoragePath(userId, restaurantId, menuItemId, file.type);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(DISH_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("uploadDishImage:", uploadError.message);
    return { url: null, error: "No se pudo subir la imagen. Intenta de nuevo." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(DISH_IMAGES_BUCKET).getPublicUrl(path);

  return { url: publicUrl, error: null };
}

export async function deleteDishImage(
  supabase: SupabaseClient,
  userId: string,
  imageUrl: string | null
): Promise<void> {
  if (!imageUrl) return;

  const marker = `/storage/v1/object/public/${DISH_IMAGES_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const path = imageUrl.slice(index + marker.length);
  if (!path.startsWith(`${userId}/`)) return;

  const { error } = await supabase.storage.from(DISH_IMAGES_BUCKET).remove([path]);
  if (error) {
    console.error("deleteDishImage:", error.message);
  }
}
