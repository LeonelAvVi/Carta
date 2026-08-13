import Link from "next/link";
import {
  BarChart3,
  Bell,
  Check,
  QrCode,
  Smartphone,
  Sparkles,
  Star,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/landing/brand-logo";
import { FadeIn } from "@/components/landing/fade-in";
import { FloatingContactButton } from "@/components/landing/floating-contact";
import { LandingNav } from "@/components/landing/landing-nav";
import { CartaMockup, DashboardMockup } from "@/components/landing/mockups";

type LandingPageProps = {
  isAuthenticated: boolean;
};

const steps = [
  {
    icon: Smartphone,
    title: "Abre",
    accent: "el menú",
    description:
      "El comensal abre tu carta digital al instante. Sin apps, sin registros, desde cualquier celular.",
  },
  {
    icon: UtensilsCrossed,
    title: "Elige",
    accent: "y pide",
    description:
      "Explora platos con precios en Bs., arma el pedido por mesa y lo envía con un toque.",
  },
  {
    icon: Bell,
    title: "Disfruta",
    accent: "el servicio",
    description:
      "Tu equipo recibe el pedido en tiempo real. Menos espera, más experiencia en la mesa.",
  },
];

const pillars = [
  {
    icon: Smartphone,
    title: "Menú digital",
    description: "Carta clara, rápida y siempre actualizada.",
  },
  {
    icon: QrCode,
    title: "Acceso inmediato",
    description: "Un enlace por mesa. El pedido llega al instante.",
  },
  {
    icon: BarChart3,
    title: "Gestión inteligente",
    description: "Mesas, staff y ventas en un solo panel.",
  },
  {
    icon: Star,
    title: "Mejor experiencia",
    description: "Tu marca, tu estilo, tu ritmo de servicio.",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "Más que un QR",
    description:
      "Plantillas Elegante, Casual y Atrevida. Colores y tipografía que hablan como tu marca — con vista previa antes de publicar.",
    mockup: "carta" as const,
  },
  {
    icon: Zap,
    title: "Pedidos en vivo",
    description:
      "Mapa visual de mesas para bartenders y meseros. Las mesas se iluminan al recibir un pedido, sin recargar la página.",
    mockup: "dashboard" as const,
  },
  {
    icon: BarChart3,
    title: "Analíticas que ayudan",
    description:
      "Ranking de los platos más pedidos. Optimiza tu carta e inventario con datos reales de tu local.",
    mockup: "chart" as const,
  },
];

const plans = [
  {
    name: "Trial",
    price: "Gratis",
    period: "para empezar",
    highlights: ["30 platos", "Fotos incluidas", "Analytics básico", "1 local"],
    featured: false,
  },
  {
    name: "Básico",
    price: "$7 USD",
    period: "/ mes",
    highlights: ["30 platos", "1 local", "Analytics básico", "Carta en Bs."],
    featured: false,
  },
  {
    name: "Pro",
    price: "$18 USD",
    period: "/ mes",
    highlights: [
      "Platos ilimitados",
      "Fotos de platos",
      "Analytics completo",
      "Mapa de mesas",
    ],
    featured: true,
  },
  {
    name: "Premium",
    price: "$35 USD",
    period: "/ mes",
    highlights: ["Todo de Pro", "Hasta 5 sucursales", "Soporte prioritario"],
    featured: false,
  },
];

function ChartMockup() {
  return (
    <div
      className="rounded-2xl border border-brand-purple/20 bg-white p-6 shadow-xl shadow-brand-purple/15"
      aria-hidden
    >
      <div className="mb-4 h-3 w-40 rounded bg-brand/90" />
      <div className="space-y-3">
        {[85, 70, 55, 40, 30].map((width, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2 w-16 rounded bg-[#E8E4FF]" />
            <div
              className="h-3 rounded-full bg-brand-purple"
              style={{ width: `${width}%`, opacity: 1 - i * 0.12 }}
            />
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">Top platos · Bs.</p>
    </div>
  );
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F4F2FF] text-brand">
      <LandingNav isAuthenticated={isAuthenticated} />
      <FloatingContactButton />

      <main>
        {/* Hero — lavanda + círculo morado sólido (pieza de marca) */}
        <section
          id="inicio"
          className="relative overflow-hidden border-b border-brand-purple/10 bg-gradient-to-br from-[#EDE9FF] via-[#F7F5FF] to-white"
        >
          <div
            className="pointer-events-none absolute -left-20 top-0 h-[28rem] w-[28rem] rounded-full bg-brand-purple/25 blur-3xl motion-safe:animate-float-soft"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-purple/20 blur-3xl"
            aria-hidden
          />
          {/* Anillo decorativo tipo isotipo */}
          <div
            className="pointer-events-none absolute -left-16 bottom-8 hidden h-56 w-56 rounded-full border-[14px] border-brand-purple/15 lg:block"
            aria-hidden
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div className="motion-safe:animate-fade-in-up">
              <BrandLogo markClassName="h-12 w-12 sm:h-14 sm:w-14" className="mb-8" />

              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-brand sm:text-5xl lg:text-[3.4rem]">
                El menú{" "}
                <span className="text-brand-purple">inteligente.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
                Tu menú digital,{" "}
                <span className="font-semibold text-brand-purple">en tu momento.</span>{" "}
                Convierte cada mesa en una experiencia — pedidos en vivo, sin app.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-purple px-7 text-sm font-semibold text-white shadow-lg shadow-brand-purple/30 transition-colors hover:bg-brand-purple-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 active:scale-[0.98]"
                  >
                    Ir a mi panel
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-purple px-7 text-sm font-semibold text-white shadow-lg shadow-brand-purple/30 transition-colors hover:bg-brand-purple-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                      Empezar gratis
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-brand-purple/30 bg-white/80 px-7 text-sm font-semibold text-brand-purple backdrop-blur-sm transition-colors hover:border-brand-purple hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
                    >
                      Ya tengo cuenta
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-6 flex items-center gap-3 text-sm font-medium text-slate-600">
                <span className="h-8 w-1 shrink-0 rounded-full bg-brand-purple" aria-hidden />
                <span>
                  <span className="font-semibold text-brand-purple">Más que un QR.</span> El
                  inicio de una mejor experiencia.
                </span>
              </p>
            </div>

            <div className="relative flex min-h-[28rem] items-center justify-center lg:justify-end">
              {/* Círculo sólido morado — ancla visual de las piezas */}
              <div
                className="pointer-events-none absolute right-0 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 rounded-full bg-brand-purple sm:h-[26rem] sm:w-[26rem] lg:right-2"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute right-8 top-[18%] h-24 w-24 rounded-full bg-[#7B61FF]/80 blur-sm motion-safe:animate-float-soft sm:right-16"
                aria-hidden
              />
              <div className="relative z-10 w-[280px] shrink-0 motion-safe:animate-float-soft">
                <CartaMockup />
              </div>
            </div>
          </div>
        </section>

        {/* Pilares sobre franja lavanda */}
        <section className="relative overflow-hidden border-b border-brand-purple/10 bg-gradient-to-r from-[#E8E2FF] via-[#F0ECFF] to-[#E8E2FF] py-16">
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-brand-purple/20 hidden lg:block"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
              {pillars.map((pillar, index) => (
                <FadeIn key={pillar.title} delay={index * 70}>
                  <div
                    className={`flex flex-col items-center px-4 text-center lg:px-6 ${
                      index < pillars.length - 1
                        ? "lg:border-r lg:border-brand-purple/20"
                        : ""
                    }`}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-purple text-white shadow-md shadow-brand-purple/25">
                      <pillar.icon className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-brand">{pillar.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {pillar.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona — bloque oscuro como posters de marca */}
        <section
          id="como-funciona"
          className="relative overflow-hidden bg-[#111827] py-20 text-white sm:py-24"
        >
          <div
            className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-purple/35 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-brand-purple/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-[10%] top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-full border-[10px] border-brand-purple/30 lg:block"
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-purple">
                  Simple y rápido
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
                  Abre. Elige.{" "}
                  <span className="text-brand-purple">Disfruta.</span>
                </h2>
                <p className="mt-4 text-slate-300">
                  Menos espera,{" "}
                  <span className="text-brand-purple">más experiencia.</span>
                </p>
              </div>
            </FadeIn>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <FadeIn key={step.title} delay={index * 100}>
                  <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-brand-purple/40 hover:bg-brand-purple/10">
                    <span className="absolute -top-3 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple text-sm font-bold text-white shadow-md shadow-brand-purple/40">
                      {index + 1}
                    </span>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/20 ring-1 ring-brand-purple/40">
                      <step.icon className="h-6 w-6 text-brand-purple" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold">
                      {step.title}{" "}
                      <span className="text-brand-purple">{step.accent}</span>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Características */}
        <section
          id="caracteristicas"
          className="relative overflow-hidden bg-gradient-to-b from-white via-[#F7F5FF] to-[#EDE9FF] py-20 sm:py-24"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-brand-purple/15 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
                  Tu menú dice mucho de{" "}
                  <span className="text-brand-purple">tu marca.</span>
                </h2>
                <p className="mt-4 text-slate-600">
                  Desde la carta que ve el comensal hasta el panel que usa tu equipo.
                </p>
              </div>
            </FadeIn>

            <div className="mt-16 flex flex-col gap-20">
              {features.map((feature, index) => (
                <FadeIn key={feature.title} delay={index * 80}>
                  <div
                    className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                      index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                    }`}
                  >
                    <div>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-white shadow-md shadow-brand-purple/30">
                        <feature.icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl font-bold text-brand">{feature.title}</h3>
                      <p className="mt-4 text-base leading-relaxed text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                    <div className="relative flex justify-center py-8">
                      <div
                        className="pointer-events-none absolute h-56 w-56 rounded-full bg-brand-purple/80 sm:h-64 sm:w-64"
                        aria-hidden
                      />
                      <div className="relative z-10">
                        {feature.mockup === "carta" && <CartaMockup />}
                        {feature.mockup === "dashboard" && (
                          <div className="w-full max-w-md">
                            <DashboardMockup />
                          </div>
                        )}
                        {feature.mockup === "chart" && (
                          <div className="w-full max-w-md">
                            <ChartMockup />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Planes */}
        <section
          id="planes"
          className="relative overflow-hidden border-t border-brand-purple/10 bg-[#E8E2FF] py-20 sm:py-24"
        >
          <div
            className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-purple/30 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
                  Planes simples,{" "}
                  <span className="text-brand-purple">sin sorpresas</span>
                </h2>
                <p className="mt-4 text-slate-600">
                  Empieza gratis. Tu carta muestra precios en bolivianos (Bs.) — la moneda que
                  tus clientes usan cada día.
                </p>
              </div>
            </FadeIn>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan, index) => (
                <FadeIn key={plan.name} delay={index * 60}>
                  <div
                    className={`flex h-full flex-col rounded-2xl border p-6 ${
                      plan.featured
                        ? "border-transparent bg-brand-purple text-white shadow-2xl shadow-brand-purple/40"
                        : "border-brand-purple/15 bg-white/90 backdrop-blur-sm"
                    }`}
                  >
                    {plan.featured ? (
                      <span className="mb-3 inline-flex w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                        Recomendado
                      </span>
                    ) : null}
                    <h3
                      className={`text-lg font-semibold ${plan.featured ? "text-white" : "text-brand"}`}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span
                        className={`text-sm ${plan.featured ? "text-white/75" : "text-slate-500"}`}
                      >
                        {" "}
                        {plan.period}
                      </span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              plan.featured ? "text-white" : "text-brand-purple"
                            }`}
                          />
                          <span className={plan.featured ? "text-white/90" : "text-slate-600"}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — morado dominante */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-[#4F35E8] to-[#111827] py-20 text-white sm:py-28">
          <div
            className="pointer-events-none absolute -left-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border-[16px] border-white/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <FadeIn>
              <BrandLogo
                inverted
                markClassName="h-12 w-12 mx-auto"
                className="mb-8 justify-center"
              />
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                Convierte cada mesa en una experiencia.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                El menú que evoluciona contigo. Donde comienza la experiencia de tu
                restaurante.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-brand-purple transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-purple"
                  >
                    Ir al panel
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-brand-purple shadow-lg transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-purple"
                    >
                      Crear cuenta gratis
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 px-8 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-purple"
                    >
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#111827] py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 lg:px-8 sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <BrandLogo inverted markClassName="h-7 w-7" />
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Tu QaRta — El menú inteligente.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/login" className="transition-colors hover:text-brand-purple">
              Iniciar sesión
            </Link>
            <Link href="/register" className="transition-colors hover:text-brand-purple">
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
