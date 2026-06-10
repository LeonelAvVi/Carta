"use client";

import { useState } from "react";
import type { MenuItemVariation } from "@/lib/types";
import { cn } from "@/lib/utils";

type VariationDraft = {
  description: string;
  price: string;
};

type MenuItemVariationsFieldProps = {
  initialVariations?: MenuItemVariation[];
  error?: string;
};

function toDrafts(variations: MenuItemVariation[]): VariationDraft[] {
  if (variations.length === 0) {
    return [{ description: "", price: "" }];
  }
  return variations.map((v) => ({
    description: v.description,
    price: String(v.price),
  }));
}

function serializeVariations(drafts: VariationDraft[]): MenuItemVariation[] {
  return drafts
    .filter((d) => d.description.trim() || d.price.trim())
    .map((d) => ({
      description: d.description.trim(),
      price: parseFloat(d.price.replace(",", ".")),
    }))
    .filter((v) => v.description && !Number.isNaN(v.price));
}

export function MenuItemVariationsField({
  initialVariations = [],
  error,
}: MenuItemVariationsFieldProps) {
  const [drafts, setDrafts] = useState<VariationDraft[]>(
    toDrafts(initialVariations)
  );

  const jsonValue = JSON.stringify(serializeVariations(drafts));

  function updateDraft(index: number, field: keyof VariationDraft, value: string) {
    setDrafts((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setDrafts((prev) => [...prev, { description: "", price: "" }]);
  }

  function removeRow(index: number) {
    setDrafts((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ description: "", price: "" }];
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-600">
          Variaciones / presentaciones
        </label>
        <span className="text-xs text-slate-400">Opcional si hay precio base</span>
      </div>

      <p className="text-xs text-slate-500">
        Ej: 500ml (~2 vasos) · Bs. 10 — 1 lt, botella retornable · Bs. 15
      </p>

      <div className="flex flex-col gap-2">
        {drafts.map((draft, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="text-xs text-slate-500">Descripción</label>
              <input
                type="text"
                value={draft.description}
                onChange={(e) => updateDraft(index, "description", e.target.value)}
                placeholder="500ml, alrededor de 2 vasos"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div className="w-full sm:w-28">
              <label className="text-xs text-slate-500">Precio (Bs.)</label>
              <input
                type="text"
                inputMode="decimal"
                value={draft.price}
                onChange={(e) => updateDraft(index, "price", e.target.value)}
                placeholder="10"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className={cn(
                "h-10 shrink-0 rounded-lg border border-slate-200 px-3 text-xs text-slate-600 hover:bg-slate-50",
                drafts.length === 1 && !draft.description && !draft.price && "invisible"
              )}
              aria-label="Quitar variación"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="w-fit text-xs font-medium text-slate-700 underline-offset-4 hover:underline"
      >
        + Agregar variación
      </button>

      <input type="hidden" name="variations" value={jsonValue} readOnly />

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
