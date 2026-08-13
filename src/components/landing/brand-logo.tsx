import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  inverted?: boolean;
};

/**
 * Isotipo Q: imagen real de marca de fondo + tres puntitos morados encima.
 * Así el anillo y la cola coinciden con el archivo de diseño.
 */
export function BrandMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  const src = inverted
    ? "/brand/logo-q-mark-light.png"
    : "/brand/logo-q-mark.png";

  return (
    <span
      className={cn("relative inline-block h-9 w-9 shrink-0", className)}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="56px"
        className="object-contain"
      />
      {/* Puntitos en el centro del anillo (un poco arriba-izq por la cola) */}
      <span className="pointer-events-none absolute left-[50%] top-[50%] flex w-[38%] -translate-x-1/2 -translate-y-1/2 items-center justify-between">
        <span className="aspect-square w-[50%] rounded-full bg-[#6D44FF] motion-safe:animate-pulse-dot" />
        <span
          className="aspect-square w-[50%] rounded-full bg-[#6D44FF] motion-safe:animate-pulse-dot mx-0.5"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="aspect-square w-[50%] rounded-full bg-[#6D44FF] motion-safe:animate-pulse-dot"
          style={{ animationDelay: "0.4s" }}
        />
      </span>
    </span>
  );
}

export function BrandLogo({
  className,
  markClassName,
  showWordmark = true,
  inverted = false,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={markClassName} inverted={inverted} />
      {showWordmark ? (
        <span
          className={cn(
            "leading-none tracking-tight",
            inverted ? "text-white" : "text-brand"
          )}
        >
          <span className="block text-[0.65rem] font-medium opacity-80 sm:text-xs">
            Tu
          </span>
          <span className="block text-lg font-bold sm:text-xl -mt-2">QaRta</span>
        </span>
      ) : null}
    </span>
  );
}
