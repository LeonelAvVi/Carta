import type { Metadata } from "next";
import { RegisterForm } from "@/components/shared/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta | Carta",
  description: "Registra tu restaurante y digitaliza tu carta",
};

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-slate-600">
          Empieza a digitalizar la carta de tu restaurante
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
