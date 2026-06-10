"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Cargando…",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors",
        "hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "motion-safe:transition-colors motion-safe:duration-200",
        className
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
