import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Carta
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Digitaliza el menú de tu restaurante y compártelo con un QR
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Ir al panel
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Crear cuenta
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
