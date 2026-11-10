import type { Metadata } from "next";
import { PartyPopper } from "lucide-react";
import { ConfettiBurst } from "@/components/shared/confetti-burst";
import { LoginForm } from "@/components/shared/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Carta",
  description: "Accede a tu panel para gestionar la carta digital",
};

type LoginPageProps = {
  searchParams: { error?: string; verified?: string; email?: string };
};

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback: "No se pudo completar el inicio de sesión. Intenta de nuevo.",
  confirm_link:
    "El enlace de confirmación no es válido o ya expiró. Inicia sesión o regístrate de nuevo para recibir otro.",
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage = searchParams.error
    ? ERROR_MESSAGES[searchParams.error]
    : undefined;
  const justVerified = searchParams.verified === "1";

  return (
    <>
      {justVerified ? <ConfettiBurst /> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {justVerified ? (
          <div className="mb-8 text-center motion-safe:animate-fade-in-up">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
              <PartyPopper className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              ¡Correo confirmado!
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tu cuenta en Tu QaRta ya está activa. Inicia sesión para empezar a
              armar tu carta digital.
            </p>
          </div>
        ) : (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Bienvenido</h1>
            <p className="mt-2 text-sm text-slate-600">
              Inicia sesión para administrar tu carta digital
            </p>
          </div>
        )}

        {errorMessage ? (
          <p
            className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <LoginForm defaultEmail={justVerified ? searchParams.email : undefined} />
      </div>
    </>
  );
}
