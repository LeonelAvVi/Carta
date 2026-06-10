import { z } from "zod";

export const categoryNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre es demasiado largo"),
});

export const categoryFormSchema = categoryNameSchema.extend({
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === undefined || v === "true"),
});

export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
