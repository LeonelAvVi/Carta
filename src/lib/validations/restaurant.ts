import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const restaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre es demasiado largo"),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .regex(slugRegex, "Usa solo minúsculas, números y guiones (ej: cafe-vienna-sucre)"),
  description: z
    .string()
    .trim()
    .max(500, "La descripción es demasiado larga")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  address: z
    .string()
    .trim()
    .max(200, "La dirección es demasiado larga")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  phone: z
    .string()
    .trim()
    .max(30, "El teléfono es demasiado largo")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido (formato #RRGGBB)"),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true"),
});

export type RestaurantFormInput = z.infer<typeof restaurantSchema>;
