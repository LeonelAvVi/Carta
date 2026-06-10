"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  reorderCategoriesAction,
  reorderFavoriteCategoriesAction,
} from "@/app/(dashboard)/dashboard/carta/actions";
import { CategorySection } from "@/components/dashboard/category-section";
import { CreateCategoryForm } from "@/components/dashboard/create-category-form";
import type { CategoryWithProducts } from "@/lib/types";

type CategoryManagerProps = {
  initialCategories: CategoryWithProducts[];
};

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const favorites = useMemo(
    () =>
      categories
        .filter((c) => c.is_favorite)
        .sort((a, b) => (a.favorite_position ?? 0) - (b.favorite_position ?? 0)),
    [categories]
  );

  const regular = useMemo(
    () => categories.filter((c) => !c.is_favorite).sort((a, b) => a.position - b.position),
    [categories]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  function handleFavoriteDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id).replace(/^fav-/, "");
    const overId = String(over.id).replace(/^fav-/, "");

    const oldIndex = favorites.findIndex((c) => c.id === activeId);
    const newIndex = favorites.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedFavorites = arrayMove(favorites, oldIndex, newIndex);
    const favoriteIds = new Set(reorderedFavorites.map((c) => c.id));

    const updated = categories.map((cat) => {
      if (!favoriteIds.has(cat.id)) return cat;
      const idx = reorderedFavorites.findIndex((f) => f.id === cat.id);
      return { ...cat, favorite_position: idx };
    });

    setCategories(updated);
    setReorderError(null);

    startTransition(async () => {
      const result = await reorderFavoriteCategoriesAction(
        reorderedFavorites.map((c) => c.id)
      );
      if (result.error) {
        setReorderError(result.error);
        setCategories(initialCategories);
      } else {
        router.refresh();
      }
    });
  }

  function handleMenuDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = regular.findIndex((c) => c.id === active.id);
    const newIndex = regular.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedRegular = arrayMove(regular, oldIndex, newIndex);
    const regularIds = new Set(reorderedRegular.map((c) => c.id));

    const updated = categories.map((cat) => {
      if (!regularIds.has(cat.id)) return cat;
      const idx = reorderedRegular.findIndex((r) => r.id === cat.id);
      return { ...cat, position: idx };
    });

    setCategories(updated);
    setReorderError(null);

    startTransition(async () => {
      const result = await reorderCategoriesAction(reorderedRegular.map((c) => c.id));
      if (result.error) {
        setReorderError(result.error);
        setCategories(initialCategories);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Agregar categoría</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ej: Postres, Bebidas, Entradas — luego agrega productos dentro de cada una
        </p>
        <div className="mt-4">
          <CreateCategoryForm />
        </div>
      </section>

      {reorderError ? (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {reorderError}
        </p>
      ) : null}

      {isPending ? (
        <p className="text-sm text-slate-500">Guardando cambios…</p>
      ) : null}

      {favorites.length > 0 ? (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Categorías favoritas
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Aparecen destacadas al inicio de la carta pública. Puedes marcar una o
              varias con ☆ Destacar.
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleFavoriteDragEnd}
          >
            <SortableContext
              items={favorites.map((c) => `fav-${c.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-4">
                {favorites.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    dragMode="favorite"
                    isEditing={editingId === category.id}
                    onEditingChange={setEditingId}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {favorites.length > 0 ? "Resto del menú" : "Categorías y productos"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Toca una categoría o producto para expandir. Ej: Postres → pastel de
            chocolate.
          </p>
        </div>

        {regular.length === 0 && favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">
              Crea tu primera categoría para empezar a agregar productos.
            </p>
          </div>
        ) : regular.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todas las categorías están marcadas como favoritas.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleMenuDragEnd}
          >
            <SortableContext
              items={regular.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-4">
                {regular.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    dragMode="menu"
                    isEditing={editingId === category.id}
                    onEditingChange={setEditingId}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>
    </div>
  );
}
