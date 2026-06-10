"use client";

import { useFormStatus } from "react-dom";
import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

function LogoutSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700",
        "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "motion-safe:transition-colors motion-safe:duration-200"
      )}
    >
      {pending ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <LogoutSubmit />
    </form>
  );
}
