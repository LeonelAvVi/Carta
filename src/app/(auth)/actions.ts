"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type AuthFormState = {
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

async function getAuthRedirectUrl() {
  const headersList = headers();
  const origin = headersList.get("origin");
  const host = headersList.get("host");

  if (origin) {
    return `${origin}/auth/callback`;
  }

  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}/auth/callback`;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/auth/callback`;
  }

  return undefined;
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthErrorMessage(error.message) };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      fieldErrors: getFieldErrors(flattened),
      error: flattened.formErrors[0],
    };
  }

  const emailRedirectTo = await getAuthRedirectUrl();
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo,
    },
  });

  if (error) {
    return { error: mapAuthErrorMessage(error.message) };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    success:
      "Cuenta creada. Revisa tu correo para confirmar el registro antes de iniciar sesión.",
  };
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
