"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { registerAction, type AuthFormState } from "@/app/(auth)/actions";
import { AuthField } from "@/components/shared/auth-field";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <AuthField
        id="fullName"
        name="fullName"
        label="Nombre completo"
        type="text"
        autoComplete="name"
        placeholder="María López"
        required
        error={state.fieldErrors?.fullName?.[0]}
      />

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
        autoComplete="new-password"
        placeholder="Mínimo 6 caracteres"
        required
        error={state.fieldErrors?.password?.[0]}
      />

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          role="status"
        >
          {state.success}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Creando cuenta…">Crear cuenta</SubmitButton>

      <p className="text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-slate-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
