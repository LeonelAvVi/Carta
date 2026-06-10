import Link from "next/link";

export default function CartaNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Carta no encontrada</h1>
      <p className="mt-3 max-w-sm text-slate-600">
        El enlace no es válido o el restaurante ya no tiene carta activa.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
