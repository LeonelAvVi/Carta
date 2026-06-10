"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  categoryFormSchema,
  categoryNameSchema,
  reorderCategoriesSchema,
} from "@/lib/validations/category";
import {
  deleteDishImage,
  uploadDishImage,
} from "@/lib/storage/dish-images";
import { syncItemVariations } from "@/lib/data/item-variations";
import {
  menuItemFormSchema,
  reorderMenuItemsSchema,
} from "@/lib/validations/menu-item";

export type CategoryActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

type RestaurantContext = {
  supabase: ReturnType<typeof createClient>;
  restaurantId: string;
  userId: string;
};

async function getRestaurantContext(): Promise<RestaurantContext | null> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    return null;
  }

  return { supabase, restaurantId: restaurant.id, userId: user.id };
}

async function applyMenuItemImage(
  ctx: RestaurantContext,
  menuItemId: string,
  formData: FormData,
  existingImageUrl: string | null
): Promise<{ imageUrl: string | null; error: string | null }> {
  const removeImage = formData.get("removeImage") === "true";
  const imageFile = formData.get("image");
  const hasNewImage = imageFile instanceof File && imageFile.size > 0;

  let imageUrl = existingImageUrl;

  if (removeImage && existingImageUrl) {
    await deleteDishImage(ctx.supabase, ctx.userId, existingImageUrl);
    imageUrl = null;
  }

  if (hasNewImage) {
    const { url, error: uploadError } = await uploadDishImage(
      ctx.supabase,
      ctx.userId,
      ctx.restaurantId,
      menuItemId,
      imageFile
    );

    if (uploadError) {
      return { imageUrl: existingImageUrl, error: uploadError };
    }

    if (existingImageUrl && existingImageUrl !== url) {
      await deleteDishImage(ctx.supabase, ctx.userId, existingImageUrl);
    }

    imageUrl = url;
  }

  return { imageUrl, error: null };
}

function revalidateCartaPaths() {
  revalidatePath("/dashboard/carta");
  revalidatePath("/dashboard/apariencia");
  revalidatePath("/dashboard");
}

function getFieldErrors(
  flattened: { fieldErrors: Record<string, string[] | undefined> }
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(flattened.fieldErrors)
      .filter((entry): entry is [string, string[]] => !!entry[1]?.length)
      .map(([key, value]) => [key, value])
  );
}

async function getNextCategoryPosition(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("categories")
    .select("position")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getNextCategoryPosition:", error.message);
    return 0;
  }

  return (data?.position ?? -1) + 1;
}

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const parsed = categoryNameSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const position = await getNextCategoryPosition(ctx.supabase, ctx.restaurantId);

  const { error } = await ctx.supabase.from("categories").insert({
    restaurant_id: ctx.restaurantId,
    name: parsed.data.name,
    position,
  is_active: true,
  is_favorite: false,
  favorite_position: null,
});

  if (error) {
    console.error("createCategoryAction:", error.message);
    return { error: "No se pudo crear la categoría" };
  }

  revalidateCartaPaths();
  return { success: "Categoría creada" };
}

export async function updateCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const categoryId = formData.get("categoryId")?.toString();
  if (!categoryId) {
    return { error: "Categoría no válida" };
  }

  const parsed = categoryFormSchema.safeParse({
    name: formData.get("name"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { error } = await ctx.supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      is_active: parsed.data.isActive,
    })
    .eq("id", categoryId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    console.error("updateCategoryAction:", error.message);
    return { error: "No se pudo actualizar la categoría" };
  }

  revalidateCartaPaths();
  return { success: "Categoría actualizada" };
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<CategoryActionState> {
  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { error } = await ctx.supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    console.error("deleteCategoryAction:", error.message);
    return { error: "No se pudo eliminar la categoría" };
  }

  revalidateCartaPaths();
  return { success: "Categoría eliminada" };
}

export async function reorderCategoriesAction(
  orderedIds: string[]
): Promise<CategoryActionState> {
  const parsed = reorderCategoriesSchema.safeParse({ orderedIds });
  if (!parsed.success) {
    return { error: "Orden de categorías no válido" };
  }

  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { data: existing, error: fetchError } = await ctx.supabase
    .from("categories")
    .select("id")
    .eq("restaurant_id", ctx.restaurantId)
    .eq("is_favorite", false);

  if (fetchError || !existing) {
    return { error: "No se pudieron cargar las categorías" };
  }

  const existingIds = new Set(existing.map((c) => c.id));
  const allValid = parsed.data.orderedIds.every((id) => existingIds.has(id));

  if (!allValid || parsed.data.orderedIds.length !== existing.length) {
    return { error: "Lista de categorías desactualizada. Recarga la página." };
  }

  const updates = parsed.data.orderedIds.map((id, index) =>
    ctx.supabase
      .from("categories")
      .update({ position: index })
      .eq("id", id)
      .eq("restaurant_id", ctx.restaurantId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    console.error("reorderCategoriesAction:", failed.error.message);
    return { error: "No se pudo guardar el orden" };
  }

  revalidateCartaPaths();
  return { success: "Orden actualizado" };
}

export async function toggleCategoryActiveAction(
  categoryId: string,
  isActive: boolean
): Promise<CategoryActionState> {
  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { error } = await ctx.supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", categoryId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    console.error("toggleCategoryActiveAction:", error.message);
    return { error: "No se pudo cambiar el estado" };
  }

  revalidateCartaPaths();
  return { success: isActive ? "Categoría activada" : "Categoría oculta" };
}

export async function toggleCategoryFavoriteAction(
  categoryId: string,
  isFavorite: boolean
): Promise<CategoryActionState> {
  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  let favoritePosition: number | null = null;

  if (isFavorite) {
    const { data: favorites } = await ctx.supabase
      .from("categories")
      .select("favorite_position")
      .eq("restaurant_id", ctx.restaurantId)
      .eq("is_favorite", true)
      .order("favorite_position", { ascending: false })
      .limit(1);

    const maxPos = favorites?.[0]?.favorite_position ?? -1;
    favoritePosition = maxPos + 1;
  }

  const { error } = await ctx.supabase
    .from("categories")
    .update({
      is_favorite: isFavorite,
      favorite_position: favoritePosition,
    })
    .eq("id", categoryId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    console.error("toggleCategoryFavoriteAction:", error.message);
    return { error: "No se pudo actualizar la categoría favorita" };
  }

  revalidateCartaPaths();
  return {
    success: isFavorite ? "Categoría marcada como favorita" : "Categoría quitada de favoritos",
  };
}

export async function reorderFavoriteCategoriesAction(
  orderedIds: string[]
): Promise<CategoryActionState> {
  const parsed = reorderCategoriesSchema.safeParse({ orderedIds });
  if (!parsed.success) {
    return { error: "Orden de favoritas no válido" };
  }

  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { data: favorites, error: fetchError } = await ctx.supabase
    .from("categories")
    .select("id")
    .eq("restaurant_id", ctx.restaurantId)
    .eq("is_favorite", true);

  if (fetchError || !favorites) {
    return { error: "No se pudieron cargar las favoritas" };
  }

  const favoriteIds = new Set(favorites.map((c) => c.id));
  const allValid = parsed.data.orderedIds.every((id) => favoriteIds.has(id));

  if (!allValid || parsed.data.orderedIds.length !== favorites.length) {
    return { error: "Lista de favoritas desactualizada. Recarga la página." };
  }

  const updates = parsed.data.orderedIds.map((id, index) =>
    ctx.supabase
      .from("categories")
      .update({ favorite_position: index })
      .eq("id", id)
      .eq("restaurant_id", ctx.restaurantId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    console.error("reorderFavoriteCategoriesAction:", failed.error.message);
    return { error: "No se pudo guardar el orden de favoritas" };
  }

  revalidateCartaPaths();
  return { success: "Orden de favoritas actualizado" };
}

async function getNextMenuItemPosition(
  supabase: ReturnType<typeof createClient>,
  categoryId: string
): Promise<number> {
  const { data } = await supabase
    .from("menu_items")
    .select("position")
    .eq("category_id", categoryId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.position ?? -1) + 1;
}

export async function createMenuItemAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const categoryId = formData.get("categoryId")?.toString();
  if (!categoryId) {
    return { error: "Categoría no válida" };
  }

  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    variations: formData.get("variations"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { data: category } = await ctx.supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("restaurant_id", ctx.restaurantId)
    .maybeSingle();

  if (!category) {
    return { error: "Categoría no encontrada" };
  }

  const position = await getNextMenuItemPosition(ctx.supabase, categoryId);

  const { data: menuItem, error } = await ctx.supabase
    .from("menu_items")
    .insert({
      category_id: categoryId,
      restaurant_id: ctx.restaurantId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      variations: parsed.data.variations,
      position,
      is_available: true,
    })
    .select("id")
    .single();

  if (error || !menuItem) {
    console.error("createMenuItemAction:", error?.message);
    return { error: "No se pudo crear el producto" };
  }

  const imageResult = await applyMenuItemImage(ctx, menuItem.id, formData, null);

  if (imageResult.error) {
    return { error: imageResult.error };
  }

  if (imageResult.imageUrl) {
    const { error: imageUpdateError } = await ctx.supabase
      .from("menu_items")
      .update({ image_url: imageResult.imageUrl })
      .eq("id", menuItem.id)
      .eq("restaurant_id", ctx.restaurantId);

    if (imageUpdateError) {
      return { error: "Producto creado pero no se pudo guardar la imagen" };
    }
  }

  const variationError = await syncItemVariations(
    ctx.supabase,
    menuItem.id,
    parsed.data.variations
  );

  if (variationError) {
    return { error: variationError };
  }

  revalidateCartaPaths();
  return { success: "Producto agregado" };
}

export async function updateMenuItemAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const menuItemId = formData.get("menuItemId")?.toString();
  if (!menuItemId) {
    return { error: "Producto no válido" };
  }

  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    variations: formData.get("variations"),
    isAvailable: formData.get("isAvailable"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { data: existing, error: fetchError } = await ctx.supabase
    .from("menu_items")
    .select("id, image_url")
    .eq("id", menuItemId)
    .eq("restaurant_id", ctx.restaurantId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Producto no encontrado" };
  }

  const imageResult = await applyMenuItemImage(
    ctx,
    menuItemId,
    formData,
    existing.image_url
  );

  if (imageResult.error) {
    return { error: imageResult.error };
  }

  const { error } = await ctx.supabase
    .from("menu_items")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      variations: parsed.data.variations,
      is_available: parsed.data.isAvailable,
      image_url: imageResult.imageUrl,
    })
    .eq("id", menuItemId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    console.error("updateMenuItemAction:", error.message);
    return { error: "No se pudo actualizar el producto" };
  }

  const variationError = await syncItemVariations(
    ctx.supabase,
    menuItemId,
    parsed.data.variations
  );

  if (variationError) {
    return { error: variationError };
  }

  revalidateCartaPaths();
  return { success: "Producto actualizado" };
}

export async function deleteMenuItemAction(
  menuItemId: string
): Promise<CategoryActionState> {
  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { data: existing, error: fetchError } = await ctx.supabase
    .from("menu_items")
    .select("image_url")
    .eq("id", menuItemId)
    .eq("restaurant_id", ctx.restaurantId)
    .maybeSingle();

  if (fetchError) {
    return { error: "No se pudo eliminar el producto" };
  }

  const { error } = await ctx.supabase
    .from("menu_items")
    .delete()
    .eq("id", menuItemId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    console.error("deleteMenuItemAction:", error.message);
    return { error: "No se pudo eliminar el producto" };
  }

  if (existing?.image_url) {
    await deleteDishImage(ctx.supabase, ctx.userId, existing.image_url);
  }

  revalidateCartaPaths();
  return { success: "Producto eliminado" };
}

export async function reorderMenuItemsAction(
  categoryId: string,
  orderedIds: string[]
): Promise<CategoryActionState> {
  const parsed = reorderMenuItemsSchema.safeParse({ categoryId, orderedIds });
  if (!parsed.success) {
    return { error: "Orden de productos no válido" };
  }

  const ctx = await getRestaurantContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { data: existing, error: fetchError } = await ctx.supabase
    .from("menu_items")
    .select("id")
    .eq("category_id", parsed.data.categoryId)
    .eq("restaurant_id", ctx.restaurantId);

  if (fetchError || !existing) {
    return { error: "No se pudieron cargar los productos" };
  }

  const existingIds = new Set(existing.map((i) => i.id));
  const allValid = parsed.data.orderedIds.every((id) => existingIds.has(id));

  if (!allValid || parsed.data.orderedIds.length !== existing.length) {
    return { error: "Lista de productos desactualizada. Recarga la página." };
  }

  const updates = parsed.data.orderedIds.map((id, index) =>
    ctx.supabase
      .from("menu_items")
      .update({ position: index })
      .eq("id", id)
      .eq("restaurant_id", ctx.restaurantId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    console.error("reorderMenuItemsAction:", failed.error.message);
    return { error: "No se pudo guardar el orden de productos" };
  }

  revalidateCartaPaths();
  return { success: "Orden de productos actualizado" };
}
