import { z } from "zod";

export const orderItemInputSchema = z.object({
  menu_item_id: z.string().uuid("Producto no válido"),
  quantity: z.coerce.number().int().min(1, "Cantidad mínima: 1").max(99),
  variation_id: z.string().uuid().nullable().optional(),
});

export const createOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  table_id: z.string().uuid(),
  items: z.array(orderItemInputSchema).min(1, "El pedido está vacío"),
  notes: z
    .string()
    .trim()
    .max(300, "Las notas son demasiado largas")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
]);

export const ORDER_STATUS_LABELS: Record<
  z.infer<typeof orderStatusSchema>,
  string
> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const NEXT_ORDER_STATUS: Partial<
  Record<z.infer<typeof orderStatusSchema>, z.infer<typeof orderStatusSchema>>
> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};
