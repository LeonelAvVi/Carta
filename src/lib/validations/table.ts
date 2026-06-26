import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const tableFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(40, "El nombre es demasiado largo"),
  slug: z
    .string()
    .trim()
    .min(1, "El identificador es obligatorio")
    .regex(slugRegex, "Usa solo minúsculas, números y guiones (ej: mesa-1)"),
  isActive: z.boolean(),
});

export type TableFormInput = z.infer<typeof tableFormSchema>;
