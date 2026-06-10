"use client";

import { useFormState } from "react-dom";
import {
  saveRestaurantAction,
  type RestaurantFormState,
} from "@/app/(dashboard)/dashboard/restaurante/actions";
import { AuthField } from "@/components/shared/auth-field";
import { LogoUploadField } from "@/components/dashboard/logo-upload-field";
import { SubmitButton } from "@/components/shared/submit-button";
import type { RestaurantRow } from "@/lib/types";
import { slugifyName } from "@/lib/utils/slug";
import { useState } from "react";

const initialState: RestaurantFormState = {};

type RestaurantFormProps = {
  restaurant?: RestaurantRow | null;
};

export function RestaurantForm({ restaurant }: RestaurantFormProps) {
  const [state, formAction] = useFormState(saveRestaurantAction, initialState);
  const [slug, setSlug] = useState(restaurant?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(restaurant?.slug));

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-6">
      {restaurant ? (
        <input type="hidden" name="restaurantId" value={restaurant.id} />
      ) : null}

      <AuthField
        id="name"
        name="name"
        label="Nombre del restaurante"
        placeholder="Café Vienna"
        required
        defaultValue={restaurant?.name}
        error={state.fieldErrors?.name?.[0]}
        onChange={(e) => {
          if (!slugTouched) {
            setSlug(slugifyName(e.target.value));
          }
        }}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={restaurant?.description ?? ""}
          placeholder="Breve descripción para tus clientes"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="text-sm text-red-600" role="alert">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>

      <AuthField
        id="address"
        name="address"
        label="Dirección"
        placeholder="Calle Aniceto Arce 123, Sucre"
        defaultValue={restaurant?.address ?? ""}
        error={state.fieldErrors?.address?.[0]}
      />

      <AuthField
        id="phone"
        name="phone"
        label="Teléfono"
        placeholder="+591 4 6423100"
        defaultValue={restaurant?.phone ?? ""}
        error={state.fieldErrors?.phone?.[0]}
      />

      <LogoUploadField
        currentLogoUrl={restaurant?.logo_url}
        error={state.fieldErrors?.logo?.[0]}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className="text-sm font-medium text-slate-700">
          URL de la carta (slug)
        </label>
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="cafe-vienna-sucre"
          required
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        />
        {state.fieldErrors?.slug?.[0] ? (
          <p className="text-sm text-red-600" role="alert">
            {state.fieldErrors.slug[0]}
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            Solo minúsculas, números y guiones. Ej: cafe-vienna-sucre
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="primaryColor" className="text-sm font-medium text-slate-700">
          Color principal
        </label>
        <input
          id="primaryColor"
          name="primaryColor"
          type="color"
          defaultValue={restaurant?.primary_color ?? "#000000"}
          className="h-11 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />
        {state.fieldErrors?.primaryColor?.[0] ? (
          <p className="text-sm text-red-600" role="alert">
            {state.fieldErrors.primaryColor[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
          Carta pública
        </label>
        <select
          id="isActive"
          name="isActive"
          defaultValue={restaurant?.is_active ? "true" : "false"}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <option value="true">Activa (visible para clientes)</option>
          <option value="false">Inactiva (oculta)</option>
        </select>
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

      <SubmitButton pendingLabel="Guardando…">
        {restaurant ? "Guardar cambios" : "Crear restaurante"}
      </SubmitButton>
    </form>
  );
}
