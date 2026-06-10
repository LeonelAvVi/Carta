"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFormState } from "react-dom";
import {
  deleteCategoryAction,
  toggleCategoryActiveAction,
  toggleCategoryFavoriteAction,
  updateCategoryAction,
  type CategoryActionState,
} from "@/app/(dashboard)/dashboard/carta/actions";
import { CreateMenuItemForm } from "@/components/dashboard/create-menu-item-form";
import { MenuItemRowComponent } from "@/components/dashboard/menu-item-row";
import { Accordion } from "@/components/shared/accordion";
import { SubmitButton } from "@/components/shared/submit-button";
import type { CategoryWithProducts } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategorySectionProps = {
  category: CategoryWithProducts;
  dragMode: "menu" | "favorite";
  onEditingChange: (categoryId: string | null) => void;
  isEditing: boolean;
};

const editInitialState: CategoryActionState = {};

function EditCategoryForm({
  category,
  onCancel,
}: {
  category: CategoryWithProducts;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateCategoryAction, editInitialState);

  useEffect(() => {
    if (state.success) {
      onCancel();
      router.refresh();
    }
  }, [state.success, onCancel, router]);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="categoryId" value={category.id} />
      <div className="flex-1">
        <input
          name="name"
          defaultValue={category.name}
          required
          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
        />
      </div>
      <select
        name="isActive"
        defaultValue={category.is_active ? "true" : "false"}
        className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
      >
        <option value="true">Activa</option>
        <option value="false">Inactiva</option>
      </select>
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Guardando…" className="sm:w-auto sm:px-4">
          Guardar
        </SubmitButton>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-lg border border-slate-200 px-4 text-sm"
        >
          Cancelar
        </button>
      </div>
      {state.error ? <p className="w-full text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}

export function CategorySection({
  category,
  dragMode,
  onEditingChange,
  isEditing,
}: CategorySectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sortId = dragMode === "favorite" ? `fav-${category.id}` : category.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortId, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const productCount = category.menu_items.length;

  function handleToggleFavorite() {
    startTransition(async () => {
      await toggleCategoryFavoriteAction(category.id, !category.is_favorite);
      router.refresh();
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      await toggleCategoryActiveAction(category.id, !category.is_active);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      await deleteCategoryAction(category.id);
      router.refresh();
    });
  }

  const dragHandle = (
    <button
      type="button"
      className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 active:cursor-grabbing"
      aria-label={`Reordenar ${category.name}`}
      onClick={(e) => e.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      ⠿
    </button>
  );

  const categoryActions = isEditing ? null : (
    <>
      <button
        type="button"
        onClick={handleToggleFavorite}
        disabled={isPending}
        className={cn(
          "rounded-lg px-2 py-1 text-xs font-medium",
          category.is_favorite
            ? "bg-amber-100 text-amber-900"
            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
        )}
      >
        {category.is_favorite ? "★" : "☆"}
      </button>
      <button
        type="button"
        onClick={() => onEditingChange(category.id)}
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
        {confirmDelete ? "OK" : "×"}
      </button>
    </>
  );

  if (isEditing) {
    return (
      <li
        ref={setNodeRef}
        style={style}
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
          isDragging && "z-10 shadow-lg"
        )}
      >
        <EditCategoryForm category={category} onCancel={() => onEditingChange(null)} />
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "z-10",
        isPending && "opacity-60",
        category.is_favorite && "ring-1 ring-amber-200 rounded-2xl"
      )}
    >
      <Accordion
        title={category.name}
        subtitle={`${productCount} producto${productCount === 1 ? "" : "s"} · ${
          category.is_active ? "Visible" : "Oculta"
        }`}
        badges={
          category.is_favorite ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
              Favorita
            </span>
          ) : null
        }
        leading={dragHandle}
        actions={categoryActions}
        className="shadow-sm"
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={isPending}
            className="text-xs text-slate-600 underline-offset-4 hover:underline"
          >
            {category.is_active ? "Marcar categoría como oculta" : "Activar categoría"}
          </button>

          {category.menu_items.length > 0 ? (
            <ul className="space-y-2">
              {category.menu_items.map((item) => (
                <MenuItemRowComponent key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Sin productos en esta categoría.</p>
          )}

          <CreateMenuItemForm categoryId={category.id} />
        </div>
      </Accordion>
    </li>
  );
}
