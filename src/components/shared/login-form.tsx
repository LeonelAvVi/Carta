"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { loginAction, type AuthFormState } from "@/app/(auth)/actions";
import { AuthField } from "@/components/shared/auth-field";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <AuthField
        id="email"
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@restaurante.com"
        required
        error={state.fieldErrors?.email?.[0]}
      />

      <AuthField
        id="password"
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        error={state.fieldErrors?.password?.[0]}
      />

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Iniciando sesión…">
        Iniciar sesión
      </SubmitButton>

      <p className="text-center text-sm text-slate-600">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-slate-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}
