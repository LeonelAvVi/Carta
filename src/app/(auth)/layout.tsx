import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex justify-center px-4 py-8">
        <Link
          href="/"
          className="text-xl font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Carta
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
