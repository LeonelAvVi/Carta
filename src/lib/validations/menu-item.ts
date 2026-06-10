import { z } from "zod";

const priceStringSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v))
  .refine(
    (v) => v === undefined || /^\d+([.,]\d{1,2})?$/.test(v),
    "Precio inválido (ej: 15 o 15.50)"
  )
  .transform((v) => {
    if (v === undefined) return null;
    return parseFloat(v.replace(",", "."));
  });

export const menuItemVariationSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "La descripción de la variación es obligatoria")
    .max(120, "Máximo 120 caracteres"),
  price: z
    .number({ error: "El precio es obligatorio" })
    .min(0, "El precio no puede ser negativo")
    .max(99999.99, "Precio demasiado alto"),
});

export const menuItemVariationsSchema = z
  .array(menuItemVariationSchema)
  .max(20, "Máximo 20 variaciones por producto");

export function parseVariationsJson(raw: FormDataEntryValue | null): unknown {
  if (!raw || typeof raw !== "string" || raw.trim() === "") {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const menuItemFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre es demasiado largo"),
    description: z
      .string()
      .trim()
      .max(500, "La descripción es demasiado larga")
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    price: priceStringSchema,
    variations: z.preprocess(
      parseVariationsJson,
      menuItemVariationsSchema.optional().default([])
    ),
    isAvailable: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === undefined || v === "true"),
  })
  .refine(
    (data) => data.price !== null || (data.variations?.length ?? 0) > 0,
    {
      message: "Indica un precio base o al menos una variación con precio",
      path: ["price"],
    }
  );

export const reorderMenuItemsSchema = z.object({
  categoryId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type MenuItemVariation = z.infer<typeof menuItemVariationSchema>;
export type MenuItemFormInput = z.infer<typeof menuItemFormSchema>;
