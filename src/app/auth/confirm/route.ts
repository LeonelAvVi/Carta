import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: EmailOtpType[] = ["email", "signup"];

/**
 * Destino del botón "Confirmar mi correo". Usa token_hash (no PKCE) para que
 * funcione aunque el usuario abra Gmail en otro dispositivo o navegador.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !type || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.redirect(`${origin}/login?error=confirm_link`);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error("auth/confirm verifyOtp:", error.message);
    return NextResponse.redirect(`${origin}/login?error=confirm_link`);
  }

  // El usuario pidió aterrizar en el login con la felicitación; sin cerrar
  // sesión, el middleware lo mandaría directo al dashboard.
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error("auth/confirm signOut:", signOutError.message);
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("verified", "1");
  if (data.user?.email) {
    loginUrl.searchParams.set("email", data.user.email);
  }

  return NextResponse.redirect(loginUrl);
}
