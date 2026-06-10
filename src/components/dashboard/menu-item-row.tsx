"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import {
  deleteMenuItemAction,
  updateMenuItemAction,
  type CategoryActionState,
} from "@/app/(dashboard)/dashboard/carta/actions";
import { MenuItemVariationsField } from "@/components/dashboard/menu-item-variations-field";
import { Accordion } from "@/components/shared/accordion";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { SubmitButton } from "@/components/shared/submit-button";
import type { MenuItemRow } from "@/lib/types";
import { formatMenuItemPriceLabel } from "@/lib/utils/menu-item";
import { cn, formatPriceBs } from "@/lib/utils";

type MenuItemRowProps = {
  item: MenuItemRow;
};

const editInitialState: CategoryActionState = {};

export function MenuItemRowComponent({ item }: MenuItemRowProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useFormState(updateMenuItemAction, editInitialState);

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
      router.refresh();
    }
  }, [state.success, router]);

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    startTransition(async () => {
      await deleteMenuItemAction(item.id);
      router.refresh();
    });
  }

  const priceLabel = formatMenuItemPriceLabel(item);

  const thumbnail = item.image_url ? (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200">
      <Image
        src={item.image_url}
        alt={item.name}
        fill
        className="object-cover"
        sizes="40px"
      />
    </div>
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
      Sin foto
    </div>
  );

  if (isEditing) {
    return (
      <li className={cn("rounded-xl border border-slate-200 bg-white p-4", isPending && "opacity-60")}>
        <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
          <input type="hidden" name="menuItemId" value={item.id} />

          <div>
            <label className="text-xs font-medium text-slate-600">Nombre</label>
            <input
              name="name"
              defaultValue={item.name}
              required
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Descripción</label>
            <textarea
              name="description"
              defaultValue={item.description ?? ""}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <ImageUploadField currentImageUrl={item.image_url} />

          <div>
            <label className="text-xs font-medium text-slate-600">Precio base (Bs.)</label>
            <input
              name="price"
              defaultValue={item.price != null ? String(item.price) : ""}
              className="mt-1 h-10 w-full max-w-xs rounded-lg border border-slate-200 px-3 text-sm"
            />
            {state.fieldErrors?.price?.[0] ? (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.price[0]}</p>
            ) : null}
          </div>

          <MenuItemVariationsField
            initialVariations={item.variations}
            error={state.fieldErrors?.variations?.[0]}
          />

          <div>
            <label className="text-xs font-medium text-slate-600">Disponibilidad</label>
            <select
              name="isAvailable"
              defaultValue={item.is_available ? "true" : "false"}
              className="mt-1 h-10 w-full max-w-xs rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="true">Disponible</option>
              <option value="false">Agotado</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <SubmitButton pendingLabel="Guardando…" className="h-10 w-fit px-4">
              Guardar
            </SubmitButton>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm text-slate-700"
            >
              Cancelar
            </button>
          </div>

          {state.error ? (
            <p className="text-xs text-red-600" role="alert">
              {state.error}
            </p>
          ) : null}
        </form>
      </li>
    );
  }

  return (
    <li className={cn(isPending && "opacity-60")}>
      <Accordion
        title={item.name}
        subtitle={priceLabel + (!item.is_available ? " · Agotado" : "")}
        leading={thumbnail}
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isPending}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className={cn(
                "rounded-lg px-2 py-1 text-xs",
                confirmDelete
                  ? "bg-red-600 text-white"
                  : "border border-red-200 text-red-600 hover:bg-red-50"
              )}
            >
              {confirmDelete ? "Confirmar" : "Eliminar"}
            </button>
          </>
        }
      >
        {item.image_url ? (
          <div className="relative mb-3 h-36 w-full max-w-xs overflow-hidden rounded-xl border border-slate-200">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
        ) : null}

        {item.description ? (
          <p className="text-sm text-slate-600">{item.description}</p>
        ) : (
          <p className="text-sm text-slate-400">Sin descripción</p>
        )}

        {item.variations.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {item.variations.map((variation, index) => (
              <li
                key={`${variation.description}-${index}`}
                className="flex justify-between gap-2 text-sm text-slate-700"
              >
                <span>{variation.description}</span>
                <span className="font-medium">{formatPriceBs(variation.price)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Accordion>
    </li>
  );
}
