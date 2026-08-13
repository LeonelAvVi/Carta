"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addEmployeeSchema } from "@/lib/validations/employee";

export type EmployeeActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
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
    .select("id, owner_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (restaurantError || !restaurant) return null;

  return { supabase, userId: user.id, restaurantId: restaurant.id };
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

const UNREGISTERED_EMAIL_MESSAGE =
  "El usuario con este correo no está registrado en Tu QaRta. Pídale que se registre primero";

async function findProfileIdByEmail(
  supabase: ReturnType<typeof createClient>,
  email: string
): Promise<{ profileId: string | null; error: string | null }> {
  const normalized = email.trim();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", normalized)
    .maybeSingle();

  if (error) {
    console.error("findProfileIdByEmail:", error.message, error.code, error.details);
    return { profileId: null, error: error.message };
  }

  if (profile?.id) {
    return { profileId: profile.id, error: null };
  }

  // Respaldo por RPC si la política RLS aún no está aplicada
  const { data: rpcId, error: rpcError } = await supabase.rpc("find_profile_id_by_email", {
    p_email: normalized,
  });

  if (rpcError) {
    console.error("findProfileIdByEmail rpc:", rpcError.message, rpcError.code);
    return { profileId: null, error: rpcError.message };
  }

  return { profileId: (rpcId as string | null) ?? null, error: null };
}

export async function addEmployeeAction(
  _prev: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const parsed = addEmployeeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const ctx = await getOwnerContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { profileId, error: lookupError } = await findProfileIdByEmail(
    ctx.supabase,
    parsed.data.email
  );

  if (lookupError) {
    return { error: "No se pudo buscar el usuario" };
  }

  if (!profileId) {
    return { error: UNREGISTERED_EMAIL_MESSAGE };
  }

  if (profileId === ctx.userId) {
    return { error: "No puedes agregarte a ti mismo como empleado" };
  }

  const { error: insertError } = await ctx.supabase.from("restaurant_employees").insert({
    restaurant_id: ctx.restaurantId,
    profile_id: profileId,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "Este usuario ya es empleado de tu local" };
    }
    console.error("addEmployeeAction insert:", insertError.message);
    return { error: "No se pudo agregar el empleado" };
  }

  revalidatePath("/dashboard/equipo");
  return { success: "Empleado agregado correctamente" };
}

export async function removeEmployeeAction(employeeId: string): Promise<EmployeeActionState> {
  const ctx = await getOwnerContext();
  if (!ctx) {
    return { error: "No se encontró tu restaurante" };
  }

  const { error } = await ctx.supabase
    .from("restaurant_employees")
    .delete()
    .eq("id", employeeId)
    .eq("restaurant_id", ctx.restaurantId);

  if (error) {
    console.error("removeEmployeeAction:", error.message);
    return { error: "No se pudo quitar el empleado" };
  }

  revalidatePath("/dashboard/equipo");
  return { success: "Empleado eliminado" };
}
