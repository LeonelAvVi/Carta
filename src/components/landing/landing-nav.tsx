"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type LandingNavProps = {
  isAuthenticated: boolean;
};

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#caracteristicas", label: "Características" },
  { href: "#planes", label: "Planes" },
];

export function LandingNav({ isAuthenticated }: LandingNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          TuCarta<span className="text-brand-accent">.bo</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Ir al panel
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-slate-200 bg-white px-4 py-4 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-2" aria-label="Móvil">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white"
              >
                Ir al panel
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-900"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
