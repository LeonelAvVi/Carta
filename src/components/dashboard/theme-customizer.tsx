"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import {
  saveRestaurantThemeAction,
  type ThemeActionState,
} from "@/app/(dashboard)/dashboard/apariencia/actions";
import {
  ColorRow,
  Divider,
  RangeRow,
  SectionLabel,
  SelectRow,
  TextRow,
  ToggleRow,
} from "@/components/dashboard/theme-controls/shared";
import { SubmitButton } from "@/components/shared/submit-button";
import { CARTA_THEME_PREVIEW_MESSAGE } from "@/components/carta-publica/carta-theme-root";
import { CART_TEMPLATE_OPTIONS, FONT_STYLE_OPTIONS } from "@/lib/theme/theme-utils";
import type { RestaurantThemeRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type ThemeCustomizerProps = {
  initialTheme: RestaurantThemeRow;
  slug: string;
};

type TabId = "header" | "body" | "footer";

const initialActionState: ThemeActionState = {};

const THEME_FORM_KEYS: Array<keyof RestaurantThemeRow> = [
  "cart_template",
  "header_bg_color",
  "header_bg_image_url",
  "header_overlay_color",
  "header_overlay_opacity",
  "header_name_color",
  "header_desc_color",
  "logo_border_color",
  "show_hours",
  "hours_text",
  "hours_color",
  "font_style",
  "body_bg_color",
  "body_bg_image_url",
  "body_overlay_color",
  "body_overlay_opacity",
  "tab_bg_color",
  "tab_text_color",
  "tab_border_color",
  "tab_active_bg_color",
  "tab_active_text_color",
  "tab_active_border_color",
  "tab_border_radius",
  "category_container_bg",
  "category_container_border",
  "category_title_color",
  "category_accent_color",
  "item_bg_color",
  "item_border_color",
  "item_name_color",
  "item_desc_color",
  "item_price_color",
  "item_image_placeholder_bg",
  "badge_featured_bg",
  "badge_featured_text_color",
  "badge_featured_label",
  "badge_unavailable_bg",
  "badge_unavailable_text_color",
  "badge_unavailable_label",
  "variation_bg_color",
  "variation_text_color",
  "variation_price_color",
  "footer_bg_color",
  "footer_text_color",
  "show_instagram",
  "instagram_url",
  "show_facebook",
  "facebook_url",
  "show_whatsapp",
  "whatsapp_number",
  "show_tiktok",
  "tiktok_url",
  "social_icon_bg",
  "social_icon_color",
  "show_address",
  "show_phone",
];

function getPreviewTheme(
  theme: RestaurantThemeRow,
  headerBgMode: "color" | "image",
  headerPreviewUrl: string | null,
  bodyPreviewUrl: string | null,
  removeHeaderBg: boolean,
  removeBodyBg: boolean
): Partial<RestaurantThemeRow> {
  return {
    ...theme,
    header_bg_image_url:
      headerBgMode === "image"
        ? removeHeaderBg
          ? headerPreviewUrl
          : headerPreviewUrl ?? theme.header_bg_image_url
        : null,
    body_bg_image_url: removeBodyBg ? bodyPreviewUrl : bodyPreviewUrl ?? theme.body_bg_image_url,
  };
}

export function ThemeCustomizer({ initialTheme, slug }: ThemeCustomizerProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [activeTab, setActiveTab] = useState<TabId>("header");
  const [headerBgMode, setHeaderBgMode] = useState<"color" | "image">(
    initialTheme.header_bg_image_url ? "image" : "color"
  );
  const [headerBgFile, setHeaderBgFile] = useState<File | null>(null);
  const [bodyBgFile, setBodyBgFile] = useState<File | null>(null);
  const [removeHeaderBg, setRemoveHeaderBg] = useState(false);
  const [removeBodyBg, setRemoveBodyBg] = useState(false);
  const [headerPreviewUrl, setHeaderPreviewUrl] = useState<string | null>(null);
  const [bodyPreviewUrl, setBodyPreviewUrl] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [state, formAction] = useFormState(saveRestaurantThemeAction, initialActionState);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setTheme(initialTheme);
    setHeaderBgMode(initialTheme.header_bg_image_url ? "image" : "color");
  }, [initialTheme]);

  useEffect(() => {
    if (!headerBgFile) {
      setHeaderPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(headerBgFile);
    setHeaderPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [headerBgFile]);

  useEffect(() => {
    if (!bodyBgFile) {
      setBodyPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(bodyBgFile);
    setBodyPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bodyBgFile]);

  function patchTheme(patch: Partial<RestaurantThemeRow>) {
    setTheme((current) => {
      const next = { ...current, ...patch };
      const preview = getPreviewTheme(
        next,
        headerBgMode,
        headerPreviewUrl,
        bodyPreviewUrl,
        removeHeaderBg,
        removeBodyBg
      );
      iframeRef.current?.contentWindow?.postMessage(
        { type: CARTA_THEME_PREVIEW_MESSAGE, theme: preview },
        window.location.origin
      );
      return next;
    });
  }

  useEffect(() => {
    const preview = getPreviewTheme(
      theme,
      headerBgMode,
      headerPreviewUrl,
      bodyPreviewUrl,
      removeHeaderBg,
      removeBodyBg
    );
    iframeRef.current?.contentWindow?.postMessage(
      { type: CARTA_THEME_PREVIEW_MESSAGE, theme: preview },
      window.location.origin
    );
  }, [theme, headerBgMode, headerPreviewUrl, bodyPreviewUrl, removeHeaderBg, removeBodyBg]);

  function updateField<K extends keyof RestaurantThemeRow>(
    key: K,
    value: RestaurantThemeRow[K]
  ) {
    patchTheme({ [key]: value } as Partial<RestaurantThemeRow>);
  }

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "header", label: "Encabezado" },
    { id: "body", label: "Cuerpo" },
    { id: "footer", label: "Pie" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid min-h-[640px] grid-cols-1 lg:grid-cols-2">
        <div className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
          <div className="flex border-b border-slate-200 bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 px-2 py-3 text-xs font-medium transition sm:text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-inset",
                  activeTab === tab.id
                    ? "border-b-2 border-slate-900 text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form
            action={formAction}
            encType="multipart/form-data"
            className="max-h-[720px] overflow-y-auto p-4"
            onSubmit={() => {
              startTransition(() => undefined);
            }}
          >
            <SectionLabel>Plantilla de carta</SectionLabel>
            <div className="mb-4 grid gap-2">
              {CART_TEMPLATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("cart_template", option.value)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                    theme.cart_template === option.value
                      ? "border-slate-900 bg-white shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>
                </button>
              ))}
            </div>

            <Divider />

            {THEME_FORM_KEYS.map((key) => {
              const rawValue = theme[key];
              const value =
                key === "header_bg_image_url" && headerBgMode === "color"
                  ? ""
                  : rawValue === null || rawValue === undefined
                    ? ""
                    : String(rawValue);

              return <input key={key} type="hidden" name={key} value={value} />;
            })}

            <input type="hidden" name="remove_header_bg_image" value={String(removeHeaderBg)} />
            <input type="hidden" name="remove_body_bg_image" value={String(removeBodyBg)} />

            {activeTab === "header" ? (
              <div>
                <SectionLabel>Fondo del encabezado</SectionLabel>
                <SelectRow
                  label="Tipo de fondo"
                  value={headerBgMode}
                  onChange={(value) => {
                    const mode = value as "color" | "image";
                    setHeaderBgMode(mode);
                    if (mode === "color") {
                      setRemoveHeaderBg(false);
                      updateField("header_bg_image_url", null);
                    }
                  }}
                  options={[
                    { value: "color", label: "Color sólido" },
                    { value: "image", label: "Imagen" },
                  ]}
                />
                {headerBgMode === "color" ? (
                  <ColorRow
                    label="Color de fondo"
                    value={theme.header_bg_color}
                    onChange={(v) => updateField("header_bg_color", v)}
                  />
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="mb-1 block text-sm text-slate-800">
                        Imagen de fondo
                      </label>
                      <input
                        type="file"
                        name="header_bg_image_file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setHeaderBgFile(file);
                          setRemoveHeaderBg(false);
                        }}
                        className="block w-full text-xs text-slate-600"
                      />
                    </div>
                    <ColorRow
                      label="Overlay de color"
                      value={theme.header_overlay_color}
                      onChange={(v) => updateField("header_overlay_color", v)}
                    />
                    <RangeRow
                      label="Opacidad overlay"
                      value={theme.header_overlay_opacity}
                      onChange={(v) => updateField("header_overlay_opacity", v)}
                    />
                    {theme.header_bg_image_url ? (
                      <ToggleRow
                        label="Quitar imagen guardada"
                        checked={removeHeaderBg}
                        onChange={setRemoveHeaderBg}
                      />
                    ) : null}
                  </>
                )}

                <Divider />
                <SectionLabel>Textos del encabezado</SectionLabel>
                <ColorRow
                  label="Color del nombre"
                  value={theme.header_name_color}
                  onChange={(v) => updateField("header_name_color", v)}
                />
                <ColorRow
                  label="Color descripción"
                  value={theme.header_desc_color}
                  onChange={(v) => updateField("header_desc_color", v)}
                />
                <ColorRow
                  label="Borde del logo"
                  value={theme.logo_border_color}
                  onChange={(v) => updateField("logo_border_color", v)}
                />

                <Divider />
                <SectionLabel>Tipografía</SectionLabel>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {FONT_STYLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("font_style", option.value)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-center text-sm transition",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                        theme.font_style === option.value
                          ? "border-slate-900 bg-white"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      {option.label}
                      <small className="mt-0.5 block text-[10px] text-slate-500">
                        {option.sample}
                      </small>
                    </button>
                  ))}
                </div>

                <Divider />
                <SectionLabel>Horario</SectionLabel>
                <ToggleRow
                  label="Mostrar horario de atención"
                  checked={theme.show_hours}
                  onChange={(v) => updateField("show_hours", v)}
                />
                <TextRow
                  label="Texto del horario"
                  value={theme.hours_text}
                  onChange={(v) => updateField("hours_text", v)}
                />
                <ColorRow
                  label="Color del horario"
                  value={theme.hours_color}
                  onChange={(v) => updateField("hours_color", v)}
                />
              </div>
            ) : null}

            {activeTab === "body" ? (
              <div>
                <SectionLabel>Fondo del cuerpo</SectionLabel>
                <ColorRow
                  label="Color de fondo"
                  value={theme.body_bg_color}
                  onChange={(v) => updateField("body_bg_color", v)}
                />
                <div className="mb-3">
                  <label className="mb-1 block text-sm text-slate-800">
                    Imagen de fondo (opcional)
                  </label>
                  <input
                    type="file"
                    name="body_bg_image_file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      setBodyBgFile(e.target.files?.[0] ?? null);
                      setRemoveBodyBg(false);
                    }}
                    className="block w-full text-xs text-slate-600"
                  />
                </div>
                <ColorRow
                  label="Overlay del cuerpo"
                  value={theme.body_overlay_color}
                  onChange={(v) => updateField("body_overlay_color", v)}
                />
                <RangeRow
                  label="Opacidad overlay"
                  value={theme.body_overlay_opacity}
                  onChange={(v) => updateField("body_overlay_opacity", v)}
                />
                {theme.body_bg_image_url ? (
                  <ToggleRow
                    label="Quitar imagen guardada"
                    checked={removeBodyBg}
                    onChange={setRemoveBodyBg}
                  />
                ) : null}

                <Divider />
                <SectionLabel>Tags de categorías</SectionLabel>
                <ColorRow label="Fondo del tag" value={theme.tab_bg_color} onChange={(v) => updateField("tab_bg_color", v)} />
                <ColorRow label="Color de texto" value={theme.tab_text_color} onChange={(v) => updateField("tab_text_color", v)} />
                <ColorRow label="Color de borde" value={theme.tab_border_color} onChange={(v) => updateField("tab_border_color", v)} />
                <SelectRow
                  label="Borde redondeado"
                  value={theme.tab_border_radius}
                  onChange={(v) =>
                    updateField("tab_border_radius", v as RestaurantThemeRow["tab_border_radius"])
                  }
                  options={[
                    { value: "pill", label: "Pill" },
                    { value: "rounded", label: "Redondeado" },
                    { value: "square", label: "Cuadrado" },
                  ]}
                />

                <Divider />
                <SectionLabel>Tag activo</SectionLabel>
                <ColorRow label="Fondo activo" value={theme.tab_active_bg_color} onChange={(v) => updateField("tab_active_bg_color", v)} />
                <ColorRow label="Texto activo" value={theme.tab_active_text_color} onChange={(v) => updateField("tab_active_text_color", v)} />
                <ColorRow label="Borde activo" value={theme.tab_active_border_color} onChange={(v) => updateField("tab_active_border_color", v)} />

                <Divider />
                <SectionLabel>Contenedor de categoría</SectionLabel>
                <ColorRow label="Fondo contenedor" value={theme.category_container_bg} onChange={(v) => updateField("category_container_bg", v)} />
                <ColorRow label="Borde contenedor" value={theme.category_container_border} onChange={(v) => updateField("category_container_border", v)} />
                <ColorRow label="Título categoría" value={theme.category_title_color} onChange={(v) => updateField("category_title_color", v)} />
                <ColorRow label="Línea decorativa" value={theme.category_accent_color} onChange={(v) => updateField("category_accent_color", v)} />

                <Divider />
                <SectionLabel>Productos</SectionLabel>
                <ColorRow label="Fondo del producto" value={theme.item_bg_color} onChange={(v) => updateField("item_bg_color", v)} />
                <ColorRow label="Borde del producto" value={theme.item_border_color} onChange={(v) => updateField("item_border_color", v)} />
                <ColorRow label="Color del nombre" value={theme.item_name_color} onChange={(v) => updateField("item_name_color", v)} />
                <ColorRow label="Color descripción" value={theme.item_desc_color} onChange={(v) => updateField("item_desc_color", v)} />
                <ColorRow label="Color del precio" value={theme.item_price_color} onChange={(v) => updateField("item_price_color", v)} />
                <ColorRow label="Fondo placeholder imagen" value={theme.item_image_placeholder_bg} onChange={(v) => updateField("item_image_placeholder_bg", v)} />

                <Divider />
                <SectionLabel>Badges</SectionLabel>
                <TextRow label="Texto destacado" value={theme.badge_featured_label} onChange={(v) => updateField("badge_featured_label", v)} />
                <ColorRow label="Fondo destacado" value={theme.badge_featured_bg} onChange={(v) => updateField("badge_featured_bg", v)} />
                <ColorRow label="Texto destacado" value={theme.badge_featured_text_color} onChange={(v) => updateField("badge_featured_text_color", v)} />
                <TextRow label="Texto agotado" value={theme.badge_unavailable_label} onChange={(v) => updateField("badge_unavailable_label", v)} />
                <ColorRow label="Fondo agotado" value={theme.badge_unavailable_bg} onChange={(v) => updateField("badge_unavailable_bg", v)} />
                <ColorRow label="Texto agotado" value={theme.badge_unavailable_text_color} onChange={(v) => updateField("badge_unavailable_text_color", v)} />

                <Divider />
                <SectionLabel>Variaciones del producto</SectionLabel>
                <ColorRow label="Fondo de variación" value={theme.variation_bg_color} onChange={(v) => updateField("variation_bg_color", v)} />
                <ColorRow label="Texto de variación" value={theme.variation_text_color} onChange={(v) => updateField("variation_text_color", v)} />
                <ColorRow label="Precio de variación" value={theme.variation_price_color} onChange={(v) => updateField("variation_price_color", v)} />
              </div>
            ) : null}

            {activeTab === "footer" ? (
              <div>
                <SectionLabel>Fondo del pie</SectionLabel>
                <ColorRow label="Color de fondo" value={theme.footer_bg_color} onChange={(v) => updateField("footer_bg_color", v)} />
                <ColorRow label="Color de texto" value={theme.footer_text_color} onChange={(v) => updateField("footer_text_color", v)} />

                <Divider />
                <SectionLabel>Redes sociales</SectionLabel>
                <ToggleRow label="Instagram" checked={theme.show_instagram} onChange={(v) => updateField("show_instagram", v)} />
                <TextRow label="URL Instagram" value={theme.instagram_url ?? ""} onChange={(v) => updateField("instagram_url", v || null)} placeholder="https://instagram.com/..." />
                <ToggleRow label="Facebook" checked={theme.show_facebook} onChange={(v) => updateField("show_facebook", v)} />
                <TextRow label="URL Facebook" value={theme.facebook_url ?? ""} onChange={(v) => updateField("facebook_url", v || null)} placeholder="https://facebook.com/..." />
                <ToggleRow label="WhatsApp" checked={theme.show_whatsapp} onChange={(v) => updateField("show_whatsapp", v)} />
                <TextRow label="Número WhatsApp" value={theme.whatsapp_number ?? ""} onChange={(v) => updateField("whatsapp_number", v || null)} placeholder="59170000000" />
                <ToggleRow label="TikTok" checked={theme.show_tiktok} onChange={(v) => updateField("show_tiktok", v)} />
                <TextRow label="URL TikTok" value={theme.tiktok_url ?? ""} onChange={(v) => updateField("tiktok_url", v || null)} placeholder="https://tiktok.com/@..." />
                <ColorRow label="Fondo íconos" value={theme.social_icon_bg} onChange={(v) => updateField("social_icon_bg", v)} />
                <ColorRow label="Color íconos" value={theme.social_icon_color} onChange={(v) => updateField("social_icon_color", v)} />

                <Divider />
                <SectionLabel>Info adicional</SectionLabel>
                <ToggleRow label="Mostrar dirección" checked={theme.show_address} onChange={(v) => updateField("show_address", v)} />
                <ToggleRow label="Mostrar teléfono" checked={theme.show_phone} onChange={(v) => updateField("show_phone", v)} />
                <p className="text-xs text-slate-500">
                  La dirección y teléfono se configuran en Restaurante.
                </p>
              </div>
            ) : null}

            {state.error ? (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {state.error}
              </p>
            ) : null}
            {state.success ? (
              <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
                {state.success}
              </p>
            ) : null}

            <div className="sticky bottom-0 mt-6 border-t border-slate-200 bg-slate-50 py-4">
              <SubmitButton pendingLabel="Guardando…">Guardar cambios</SubmitButton>
            </div>
          </form>
        </div>

        <div className="bg-slate-100 p-4">
          <p className="mb-3 text-center text-xs font-medium text-slate-500">
            Vista previa en tiempo real.
          </p>
          <div className="mx-auto max-w-[320px] overflow-hidden rounded-[36px] border-[6px] border-neutral-900 bg-white shadow-lg">
            <iframe
              ref={iframeRef}
              title="Vista previa de la carta"
              src={`/carta/${slug}?preview=true`}
              className="h-[640px] w-full border-0"
            />
          </div>
          <p className="mt-3 text-center text-xs font-normal text-slate-400">
            En algunos casos la vista previa puede mostrar alguna inconsistencia, pero no te preocupes, la carta para el usuario final esta optimizada para que se vea correctamente.
          </p>
        </div>
      </div>
    </div>
  );
}
