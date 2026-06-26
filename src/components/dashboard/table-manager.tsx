"use client";

import { useFormState } from "react-dom";
import { useState, useTransition } from "react";
import {
  createTableAction,
  deleteTableAction,
  updateTableAction,
  type TableActionState,
} from "@/app/(dashboard)/dashboard/mesas/actions";
import { AuthField } from "@/components/shared/auth-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { getTableCartaUrl } from "@/lib/carta/table-urls";
import type { RestaurantRow, TableRow } from "@/lib/types";
import { slugifyName } from "@/lib/utils/slug";
import { cn } from "@/lib/utils";

const initialState: TableActionState = {};

type TableManagerProps = {
  tables: TableRow[];
  restaurant: RestaurantRow;
};

function DeleteTableButton({ tableId }: { tableId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await deleteTableAction(tableId);
            if (result.error) setError(result.error);
          });
        }}
        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {isPending ? "Eliminando…" : "Eliminar"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function TableForm({
  restaurant,
  table,
  onCancel,
}: {
  restaurant: RestaurantRow;
  table?: TableRow;
  onCancel?: () => void;
}) {
  const action = table ? updateTableAction : createTableAction;
  const [state, formAction] = useFormState(action, initialState);
  const [slug, setSlug] = useState(table?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(table?.slug));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {table ? <input type="hidden" name="tableId" value={table.id} /> : null}
      <input type="hidden" name="isActive" value="true" />

      <AuthField
        id={table ? `name-${table.id}` : "table-name"}
        name="name"
        label="Nombre de la mesa"
        placeholder="Mesa 1, Terraza A…"
        required
        defaultValue={table?.name}
        error={state.fieldErrors?.name?.[0]}
        onChange={(e) => {
          if (!slugTouched) setSlug(slugifyName(e.target.value));
        }}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor={table ? `slug-${table.id}` : "table-slug"} className="text-sm font-medium text-slate-700">
          Identificador (para el QR)
        </label>
        <input
          id={table ? `slug-${table.id}` : "table-slug"}
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="mesa-1"
          required
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        />
        {state.fieldErrors?.slug?.[0] ? (
          <p className="text-sm text-red-600" role="alert">
            {state.fieldErrors.slug[0]}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          {state.success}
        </p>
      ) : null}

      <div className="flex gap-2">
        <SubmitButton className="!w-auto flex-1">
          {table ? "Guardar" : "Crear mesa"}
        </SubmitButton>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        ) : null}
      </div>

      {!table && slug ? (
        <p className="text-xs text-slate-500">
          Enlace del QR:{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5">
            {getTableCartaUrl(restaurant.slug, slug)}
          </code>
        </p>
      ) : null}
    </form>
  );
}

export function TableManager({ tables, restaurant }: TableManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Nueva mesa</h2>
        <p className="mt-1 text-sm text-slate-600">
          Cada mesa tiene un enlace único. Imprimí el QR y colocalo en la mesa.
        </p>
        <div className="mt-4">
          <TableForm restaurant={restaurant} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Mesas ({tables.length})
        </h2>

        {tables.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            Aún no hay mesas. Crea la primera arriba.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {tables.map((table) => (
              <li
                key={table.id}
                className={cn(
                  "rounded-xl border border-slate-200 p-4",
                  !table.is_active && "opacity-60"
                )}
              >
                {editingId === table.id ? (
                  <TableForm
                    restaurant={restaurant}
                    table={table}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{table.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        ID: <code>{table.slug}</code>
                      </p>
                      <a
                        href={getTableCartaUrl(restaurant.slug, table.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
                      >
                        Abrir carta de esta mesa
                      </a>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(table.id)}
                        className="text-sm font-medium text-slate-700 hover:text-slate-900"
                      >
                        Editar
                      </button>
                      <DeleteTableButton tableId={table.id} />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
