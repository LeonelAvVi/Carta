"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/landing/brand-logo";
import { cn } from "@/lib/utils";

type LandingNavProps = {
  isAuthenticated: boolean;
};

const links = [
  { href: "#inicio", id: "inicio", label: "Inicio" },
  { href: "#como-funciona", id: "como-funciona", label: "Cómo funciona" },
  { href: "#caracteristicas", id: "caracteristicas", label: "Características" },
  { href: "#planes", id: "planes", label: "Planes" },
] as const;

export function LandingNav({ isAuthenticated }: LandingNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("inicio");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Resalta el link de la sección que más ocupa el viewport (debajo del nav).
  useEffect(() => {
    const sectionIds = links.map((l) => l.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const visibleRatio = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleRatio.set(entry.target.id, entry.intersectionRatio);
        }

        let bestId = sectionIds[0];
        let bestRatio = -1;
        for (const id of sectionIds) {
          const ratio = visibleRatio.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        // Si casi no hay intersección (fin de página), usa la última sección visible.
        if (bestRatio < 0.05) {
          const nearBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 80;
          if (nearBottom) {
            setActiveId(sectionIds[sectionIds.length - 1]);
            return;
          }
        }

        setActiveId(bestId);
      },
      {
        // Compensa la altura del nav sticky (~80px) y prioriza el tercio superior.
        rootMargin: "-88px 0px -45% 0px",
        threshold: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-b border-brand-purple/20 bg-white/95 shadow-[0_8px_30px_rgba(93,68,255,0.12)] backdrop-blur-xl"
          : "border-b border-transparent bg-[#F7F5FF]/80 backdrop-blur-md"
      )}
    >
      <div
        className={cn(
          "h-1 w-full bg-gradient-to-r from-brand-purple via-[#7B61FF] to-brand-purple transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-90"
        )}
        aria-hidden
      />

      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.75rem] lg:px-8">
        <Link
          href="/"
          className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
          aria-label="Tu QaRta — inicio"
        >
          <BrandLogo markClassName="h-9 w-9 sm:h-10 sm:w-10" />
        </Link>

        <nav
          className="hidden items-center rounded-full border border-brand-purple/15 bg-white/70 p-1.5 shadow-sm shadow-brand-purple/5 backdrop-blur-sm md:flex"
          aria-label="Principal"
        >
          {links.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple",
                  isActive
                    ? "bg-brand-purple/15 text-brand-purple"
                    : "text-slate-600 hover:bg-brand-purple/10 hover:text-brand-purple"
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand-purple px-5 text-sm font-semibold text-white shadow-md shadow-brand-purple/30 transition-colors hover:bg-brand-purple-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Ir al panel
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand-purple px-5 text-sm font-semibold text-white shadow-md shadow-brand-purple/30 transition-colors hover:bg-brand-purple-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Empezar gratis
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-purple/20 bg-white text-brand-purple shadow-sm transition-colors hover:bg-brand-purple hover:text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-brand-purple/10 bg-white/95 px-4 py-4 shadow-lg shadow-brand-purple/10 backdrop-blur-xl md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1" aria-label="Móvil">
          {links.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 ease-out",
                  isActive
                    ? "bg-brand-purple/15 text-brand-purple"
                    : "text-slate-700 hover:bg-brand-purple/10 hover:text-brand-purple"
                )}
              >
                {link.label}
              </a>
            );
          })}
          <div className="mt-3 flex flex-col gap-2 border-t border-brand-purple/10 pt-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand-purple text-sm font-semibold text-white shadow-md shadow-brand-purple/25"
              >
                Ir al panel
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-brand-purple/25 text-sm font-semibold text-brand-purple"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-brand-purple text-sm font-semibold text-white shadow-md shadow-brand-purple/25"
                >
                  Empezar gratis
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
