"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  deleteRestaurantLogo,
  uploadRestaurantLogo,
} from "@/lib/storage/logos";
import { ensureUserProfile } from "@/lib/data/ensure-profile";
import { restaurantSchema } from "@/lib/validations/restaurant";

export type RestaurantFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function getFieldErrors(
  flattened: { fieldErrors: Record<string, string[] | undefined> }
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(flattened.fieldErrors)
      .filter((entry): entry is [string, string[]] => !!entry[1]?.length)
      .map(([key, value]) => [key, value])
  );
}

function mapDbError(message: string, code?: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("restaurants_slug_unique") || code === "23505") {
    if (msg.includes("slug")) {
      return "Ese slug ya está en uso. Elige otro.";
    }
  }

  if (msg.includes("restaurants_slug_format") || msg.includes("check constraint")) {
    return "El slug no es válido. Usa solo minúsculas, números y guiones.";
  }

  if (
    msg.includes("restaurants_owner_id_fkey") ||
    msg.includes("profiles") && msg.includes("foreign key")
  ) {
    return "Tu perfil no está listo. Recarga la página e intenta de nuevo.";
  }

  if (msg.includes("row-level security") || code === "42501") {
    return "No tienes permiso para guardar. Verifica que iniciaste sesión.";
  }

  if (process.env.NODE_ENV === "development") {
    return `Error de base de datos: ${message}`;
  }

  return "No se pudo guardar el restaurante. Intenta de nuevo.";
}

async function getUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, userId: null, user: null };
  }

  return { supabase, userId: user.id, user };
}

function revalidateDashboardPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/restaurante");
  revalidatePath("/dashboard/carta");
  revalidatePath("/dashboard/apariencia");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/cuenta");
}

export async function saveRestaurantAction(
  _prevState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  const parsed = restaurantSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    primaryColor: formData.get("primaryColor"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const { supabase, userId, user } = await getUserId();
  if (!userId || !user) {
    return { error: "Debes iniciar sesión para continuar" };
  }

  const profileResult = await ensureUserProfile(supabase, user);
  if (!profileResult.ok) {
    return { error: profileResult.error };
  }

  const restaurantId = formData.get("restaurantId")?.toString();
  const removeLogo = formData.get("removeLogo") === "true";
  const logoFile = formData.get("logo");
  const hasNewLogo = logoFile instanceof File && logoFile.size > 0;

  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    address: parsed.data.address ?? null,
    phone: parsed.data.phone ?? null,
    primary_color: parsed.data.primaryColor,
    is_active: parsed.data.isActive,
  };

  let savedRestaurantId = restaurantId;
  let existingLogoUrl: string | null = null;

  if (restaurantId) {
    const { data: existing, error: fetchError } = await supabase
      .from("restaurants")
      .select("id, logo_url")
      .eq("id", restaurantId)
      .eq("owner_id", userId)
      .maybeSingle();

    if (fetchError || !existing) {
      return { error: "No se encontró el restaurante" };
    }

    existingLogoUrl = existing.logo_url;

    const { error } = await supabase
      .from("restaurants")
      .update(payload)
      .eq("id", restaurantId)
      .eq("owner_id", userId);

    if (error) {
      console.error("saveRestaurantAction update:", error.message, error.code);
      return { error: mapDbError(error.message, error.code) };
    }
  } else {
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .insert({ ...payload, owner_id: userId })
      .select("id")
      .single();

    if (restaurantError) {
      console.error(
        "saveRestaurantAction insert:",
        restaurantError.message,
        restaurantError.code
      );
      return { error: mapDbError(restaurantError.message, restaurantError.code) };
    }

    savedRestaurantId = restaurant.id;

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { error: subscriptionError } = await supabase.from("subscriptions").insert({
      restaurant_id: restaurant.id,
      plan: "trial",
      status: "active",
      trial_ends_at: trialEndsAt.toISOString(),
    });

    if (subscriptionError) {
      console.error("saveRestaurantAction subscription:", subscriptionError.message);
    }
  }

  if (!savedRestaurantId) {
    return { error: "No se pudo guardar el restaurante" };
  }

  let logoUrl = existingLogoUrl;

  if (removeLogo && existingLogoUrl) {
    await deleteRestaurantLogo(supabase, userId, existingLogoUrl);
    logoUrl = null;
  }

  if (hasNewLogo) {
    const { url, error: uploadError } = await uploadRestaurantLogo(
      supabase,
      userId,
      savedRestaurantId,
      logoFile
    );

    if (uploadError) {
      return { error: uploadError };
    }

    if (existingLogoUrl && existingLogoUrl !== url) {
      await deleteRestaurantLogo(supabase, userId, existingLogoUrl);
    }

    logoUrl = url;
  }

  if (removeLogo || hasNewLogo) {
    const { error: logoUpdateError } = await supabase
      .from("restaurants")
      .update({ logo_url: logoUrl })
      .eq("id", savedRestaurantId)
      .eq("owner_id", userId);

    if (logoUpdateError) {
      return { error: "El restaurante se guardó pero no se pudo actualizar el logo" };
    }
  }

  revalidateDashboardPaths();

  return { success: "Restaurante guardado correctamente" };
}
