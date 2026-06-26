import { z } from "zod";

export const addEmployeeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa un correo electrónico")
    .email("Correo electrónico no válido"),
});

export type AddEmployeeInput = z.infer<typeof addEmployeeSchema>;
