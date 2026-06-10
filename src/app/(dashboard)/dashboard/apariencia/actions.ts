"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  deleteThemeBackground,
  uploadThemeBackground,
} from "@/lib/storage/theme-backgrounds";
import { parseThemeFormData } from "@/lib/validations/restaurant-theme";

export type ThemeActionState = {
  error?: string;
  success?: string;
};

async function getOwnerContext() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (restaurantError || !restaurant) return null;

  return { supabase, userId: user.id, restaurantId: restaurant.id };
}

function revalidateThemePaths(slug?: string) {
  revalidatePath("/dashboard/apariencia");
  if (slug) {
    revalidatePath(`/carta/${slug}`);
  }
}

export async function saveRestaurantThemeAction(
  _prev: ThemeActionState,
  formData: FormData
): Promise<ThemeActionState> {
  const ctx = await getOwnerContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  let parsed;
  try {
    parsed = parseThemeFormData(formData);
  } catch {
    return { error: "Los datos del tema no son válidos. Revisa los campos." };
  }

  const { data: existingTheme, error: fetchError } = await ctx.supabase
    .from("restaurant_theme")
    .select("header_bg_image_url, body_bg_image_url")
    .eq("restaurant_id", ctx.restaurantId)
    .maybeSingle();

  if (fetchError) {
    console.error("saveRestaurantThemeAction fetch:", fetchError.message);
    return { error: "No se pudo cargar el tema actual" };
  }

  let headerBgImageUrl = parsed.header_bg_image_url ?? null;
  let bodyBgImageUrl = parsed.body_bg_image_url ?? null;

  const removeHeaderBg = formData.get("remove_header_bg_image") === "true";
  const removeBodyBg = formData.get("remove_body_bg_image") === "true";

  const headerBgFile = formData.get("header_bg_image_file");
  const bodyBgFile = formData.get("body_bg_image_file");

  if (removeHeaderBg && existingTheme?.header_bg_image_url) {
    await deleteThemeBackground(
      ctx.supabase,
      ctx.userId,
      existingTheme.header_bg_image_url
    );
    headerBgImageUrl = null;
  }

  if (removeBodyBg && existingTheme?.body_bg_image_url) {
    await deleteThemeBackground(
      ctx.supabase,
      ctx.userId,
      existingTheme.body_bg_image_url
    );
    bodyBgImageUrl = null;
  }

  if (headerBgFile instanceof File && headerBgFile.size > 0) {
    const { url, error: uploadError } = await uploadThemeBackground(
      ctx.supabase,
      ctx.userId,
      ctx.restaurantId,
      "header",
      headerBgFile
    );
    if (uploadError) return { error: uploadError };
    if (existingTheme?.header_bg_image_url && existingTheme.header_bg_image_url !== url) {
      await deleteThemeBackground(
        ctx.supabase,
        ctx.userId,
        existingTheme.header_bg_image_url
      );
    }
    headerBgImageUrl = url;
  }

  if (bodyBgFile instanceof File && bodyBgFile.size > 0) {
    const { url, error: uploadError } = await uploadThemeBackground(
      ctx.supabase,
      ctx.userId,
      ctx.restaurantId,
      "body",
      bodyBgFile
    );
    if (uploadError) return { error: uploadError };
    if (existingTheme?.body_bg_image_url && existingTheme.body_bg_image_url !== url) {
      await deleteThemeBackground(
        ctx.supabase,
        ctx.userId,
        existingTheme.body_bg_image_url
      );
    }
    bodyBgImageUrl = url;
  }

  const payload = {
    ...parsed,
    header_bg_image_url: headerBgImageUrl,
    body_bg_image_url: bodyBgImageUrl,
    restaurant_id: ctx.restaurantId,
  };

  const { error: upsertError } = await ctx.supabase
    .from("restaurant_theme")
    .upsert(payload, { onConflict: "restaurant_id" });

  if (upsertError) {
    console.error("saveRestaurantThemeAction:", upsertError.message);
    return { error: "No se pudo guardar el tema. Intenta de nuevo." };
  }

  const { data: restaurant } = await ctx.supabase
    .from("restaurants")
    .select("slug")
    .eq("id", ctx.restaurantId)
    .maybeSingle();

  revalidateThemePaths(restaurant?.slug);
  return { success: "Apariencia guardada correctamente" };
}
