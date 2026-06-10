"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type AccordionProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Accordion({
  title,
  subtitle,
  badges,
  actions,
  leading,
  defaultOpen = false,
  children,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white", className)}>
      <div className="flex items-start gap-2 px-3 py-3 sm:px-4">
        {leading}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden
            className={cn(
              "mt-0.5 shrink-0 text-slate-500 transition-transform motion-safe:duration-200",
              open && "rotate-90"
            )}
          >
            ›
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 sm:text-base">{title}</span>
              {badges}
            </span>
            {subtitle ? (
              <span className="mt-0.5 block text-xs text-slate-500 sm:text-sm">{subtitle}</span>
            ) : null}
          </span>
        </button>

        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {open ? (
        <div id={panelId} className="border-t border-slate-100 px-3 py-4 sm:px-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}
