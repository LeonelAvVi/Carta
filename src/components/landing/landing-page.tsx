import Link from "next/link";
import {
  BarChart3,
  Check,
  Palette,
  QrCode,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { LandingNav } from "@/components/landing/landing-nav";
import { CartaMockup, DashboardMockup } from "@/components/landing/mockups";

type LandingPageProps = {
  isAuthenticated: boolean;
};

const steps = [
  {
    icon: Sparkles,
    title: "Crea tu menú",
    description:
      "Carga tus platos, precios en bolivianos (Bs.) y elige una plantilla que refleje el estilo de tu local.",
  },
  {
    icon: QrCode,
    title: "Imprime tu QR",
    description:
      "Genera códigos por mesa o para todo el local. Tus clientes escanean y ven la carta al instante.",
  },
  {
    icon: Zap,
    title: "Gestiona tus pedidos",
    description:
      "Recibe pedidos en tiempo real en el mapa de mesas. Tu equipo actualiza estados sin fricción.",
  },
];

const features = [
  {
    icon: Palette,
    title: "Cartas personalizables",
    description:
      "Plantillas Elegante, Casual y Atrevida. Colores, tipografía y vista previa en tiempo real antes de publicar.",
    mockup: "carta" as const,
  },
  {
    icon: Users,
    title: "Gestión Staff",
    description:
      "Mapa visual de mesas para bartenders y meseros. Las mesas se iluminan al recibir un pedido — sin recargar la página.",
    mockup: "dashboard" as const,
  },
  {
    icon: BarChart3,
    title: "Analíticas inteligentes",
    description:
      "Ranking de los 10 platos más vendidos por mes. Optimiza tu inventario con datos reales de pedidos entregados.",
    mockup: "chart" as const,
  },
];

const benefits = [
  {
    icon: QrCode,
    title: "Ahorra en impresiones",
    description: "Olvídate de reimprimir cartas cada vez que cambias un precio o un plato.",
  },
  {
    icon: Smartphone,
    title: "Cero fricción para el cliente",
    description: "Sin apps, sin registros. Solo escanean el QR y piden desde su celular.",
  },
  {
    icon: Zap,
    title: "Acceso total desde tu celular",
    description: "Administra tu local desde el dashboard, diseñado para dueños en Bolivia.",
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg" aria-hidden>
      <div className="mb-4 h-3 w-40 rounded bg-slate-800/90" />
      <div className="space-y-3">
        {[85, 70, 55, 40, 30].map((width, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2 w-16 rounded bg-slate-200" />
            <div className="h-3 rounded-full bg-slate-900" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">Top platos · Bs.</p>
    </div>
  );
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingNav isAuthenticated={isAuthenticated} />

      <main>
        {/* Hero */}
        <section
          id="inicio"
          className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 via-white to-white"
        >
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-slate-900/5 blur-3xl" />

          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div className="motion-safe:animate-fade-in-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Hecho para restaurantes en Bolivia
              </p>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Tu restaurante en la era digital:{" "}
                <span className="text-slate-700">Menú QR y Gestión de Pedidos</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Moderniza tu local, recibe pedidos en tiempo real y analiza tus ventas.
                Todo sin que tus clientes instalen ninguna app. Precios en bolivianos (Bs.)
                en tu carta pública.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    Ir a mi panel
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    >
                      Empezar gratis
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    >
                      Ya tengo cuenta
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -right-4 top-8 hidden w-56 lg:block">
                <DashboardMockup />
              </div>
              <div className="relative z-10">
                <CartaMockup />
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-b border-slate-100 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Cómo funciona
                </h2>
                <p className="mt-4 text-slate-600">
                  Tres pasos para llevar tu local al siguiente nivel, sin complicaciones técnicas.
                </p>
              </div>
            </FadeIn>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <FadeIn key={step.title} delay={index * 100}>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-8 transition-shadow hover:shadow-md">
                    <span className="absolute -top-3 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                      <step.icon className="h-6 w-6 text-slate-900" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Características */}
        <section id="caracteristicas" className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Todo lo que tu local necesita
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
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <feature.icon className="h-6 w-6" strokeWidth={1.75} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{feature.title}</h3>
                      <p className="mt-4 text-base leading-relaxed text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                    <div className="flex justify-center">
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
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="border-y border-slate-100 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Beneficios para tu negocio
              </h2>
            </FadeIn>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {benefits.map((benefit, index) => (
                <FadeIn key={benefit.title} delay={index * 80}>
                  <div className="rounded-2xl border border-slate-200 p-6 text-center transition-shadow hover:shadow-md">
                    <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                      <benefit.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{benefit.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Planes */}
        <section id="planes" className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Planes simples, sin sorpresas
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
                        ? "border-slate-900 bg-slate-900 text-white shadow-xl"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {plan.featured ? (
                      <span className="mb-3 inline-flex w-fit rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-slate-900">
                        Recomendado
                      </span>
                    ) : null}
                    <h3
                      className={`text-lg font-semibold ${plan.featured ? "text-white" : "text-slate-900"}`}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span
                        className={`text-sm ${plan.featured ? "text-slate-300" : "text-slate-500"}`}
                      >
                        {" "}
                        {plan.period}
                      </span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-amber-400" : "text-emerald-600"}`}
                          />
                          <span className={plan.featured ? "text-slate-200" : "text-slate-600"}>
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

        {/* CTA final */}
        <section className="bg-slate-900 py-20 text-white sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                ¿Listo para digitalizar tu éxito?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Únete a los restaurantes en Bolivia que ya modernizaron su carta y sus pedidos
                con TuCarta.bo.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    Ir al panel
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-400 px-8 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-300"
                    >
                      Crear cuenta gratis
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
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

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8 sm:text-left">
          <p>
            © {new Date().getFullYear()} TuCarta.bo — Carta digital y pedidos por QR para Bolivia.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-slate-900">
              Iniciar sesión
            </Link>
            <Link href="/register" className="hover:text-slate-900">
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
