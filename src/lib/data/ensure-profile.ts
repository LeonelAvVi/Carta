import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("ensureUserProfile select:", selectError.message);
    return { ok: false, error: "No se pudo verificar tu perfil" };
  }

  if (existing) {
    return { ok: true };
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
  });

  if (insertError) {
    console.error("ensureUserProfile insert:", insertError.message);
    return {
      ok: false,
      error:
        "Tu perfil no está configurado. Ejecuta la migración fix_profiles_insert en Supabase o contacta soporte.",
    };
  }

  return { ok: true };
}
