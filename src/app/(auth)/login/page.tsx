import type { Metadata } from "next";
import { LoginForm } from "@/components/shared/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Carta",
  description: "Accede a tu panel para gestionar la carta digital",
};

type LoginPageProps = {
  searchParams: { error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const callbackError =
    searchParams.error === "auth_callback"
      ? "No se pudo completar el inicio de sesión. Intenta de nuevo."
      : undefined;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Bienvenido</h1>
        <p className="mt-2 text-sm text-slate-600">
          Inicia sesión para administrar tu carta digital
        </p>
      </div>

      {callbackError ? (
        <p
          className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {callbackError}
        </p>
      ) : null}

      <LoginForm />
    </div>
  );
}
