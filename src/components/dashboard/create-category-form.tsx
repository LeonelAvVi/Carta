"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import {
  createCategoryAction,
  type CategoryActionState,
} from "@/app/(dashboard)/dashboard/carta/actions";
import { AuthField } from "@/components/shared/auth-field";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: CategoryActionState = {};

export function CreateCategoryForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(createCategoryAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form
      key={state.success ? "reset" : "default"}
      action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex-1">
        <AuthField
          id="categoryName"
          name="name"
          label="Nueva categoría"
          placeholder="Ej: Entradas, Principales, Postres"
          required
          error={state.fieldErrors?.name?.[0]}
        />
      </div>
      <div className="sm:pt-7">
        <SubmitButton pendingLabel="Creando…" className="sm:w-auto sm:px-6">
          Agregar
        </SubmitButton>
      </div>

      {state.error ? (
        <p className="w-full text-sm text-red-600 sm:col-span-2" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="w-full text-sm text-emerald-700 sm:col-span-2" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
