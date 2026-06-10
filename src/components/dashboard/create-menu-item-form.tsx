"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import {
  createMenuItemAction,
  type CategoryActionState,
} from "@/app/(dashboard)/dashboard/carta/actions";
import { MenuItemVariationsField } from "@/components/dashboard/menu-item-variations-field";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: CategoryActionState = {};

type CreateMenuItemFormProps = {
  categoryId: string;
};

export function CreateMenuItemForm({ categoryId }: CreateMenuItemFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(createMenuItemAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form
      key={state.success ? `reset-${Date.now()}` : categoryId}
      action={formAction}
      encType="multipart/form-data"
      className="flex flex-col gap-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4"
    >
      <input type="hidden" name="categoryId" value={categoryId} />

      <p className="text-xs font-medium text-slate-700">Nuevo producto</p>

      <div>
        <label
          htmlFor={`product-name-${categoryId}`}
          className="text-xs font-medium text-slate-600"
        >
          Nombre
        </label>
        <input
          id={`product-name-${categoryId}`}
          name="name"
          placeholder="Ej: Refresco de Coca"
          required
          className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={`product-desc-${categoryId}`}
          className="text-xs font-medium text-slate-600"
        >
          Descripción
        </label>
        <textarea
          id={`product-desc-${categoryId}`}
          name="description"
          rows={2}
          placeholder="Delicioso refresco frío de coca cola"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <ImageUploadField error={state.fieldErrors?.image?.[0]} />

      <div>
        <label className="text-xs font-medium text-slate-600">
          Precio base (Bs.) — opcional
        </label>
        <input
          name="price"
          placeholder="25"
          inputMode="decimal"
          className="mt-1 h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm"
        />
        {state.fieldErrors?.price?.[0] ? (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.price[0]}</p>
        ) : null}
      </div>

      <MenuItemVariationsField error={state.fieldErrors?.variations?.[0]} />

      <SubmitButton pendingLabel="Agregando…" className="h-10 w-fit px-6">
        Agregar producto
      </SubmitButton>

      {state.error ? (
        <p className="text-xs text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
