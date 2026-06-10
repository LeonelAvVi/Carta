import type { SupabaseClient } from "@supabase/supabase-js";
import type { MenuItemVariation } from "@/lib/types";

export async function syncItemVariations(
  supabase: SupabaseClient,
  menuItemId: string,
  variations: MenuItemVariation[]
): Promise<string | null> {
  const { error: deleteError } = await supabase
    .from("item_variations")
    .delete()
    .eq("menu_item_id", menuItemId);

  if (deleteError) {
    console.error("syncItemVariations delete:", deleteError.message);
    return "No se pudieron actualizar las variaciones";
  }

  if (variations.length === 0) {
    return null;
  }

  const rows = variations.map((variation, index) => ({
    menu_item_id: menuItemId,
    name: variation.description,
    price: variation.price,
    position: index,
    is_available: true,
  }));

  const { error: insertError } = await supabase.from("item_variations").insert(rows);

  if (insertError) {
    console.error("syncItemVariations insert:", insertError.message);
    return "No se pudieron guardar las variaciones";
  }

  return null;
}
