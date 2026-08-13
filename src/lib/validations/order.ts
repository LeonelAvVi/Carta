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
  "closed",
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
  closed: "Cerrado",
};

/** Colores compartidos: badge de estado y botón “marcar como…”. */
export const ORDER_STATUS_STYLES: Record<
  z.infer<typeof orderStatusSchema>,
  { badge: string; button: string }
> = {
  pending: {
    badge: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
    button: "bg-amber-500 text-white hover:bg-amber-600",
  },
  confirmed: {
    badge: "bg-sky-100 text-sky-900 ring-1 ring-sky-200",
    button: "bg-sky-500 text-white hover:bg-sky-600",
  },
  preparing: {
    badge: "bg-[#F0ECFF] text-brand-purple ring-1 ring-brand-purple/25",
    button: "bg-brand-purple text-white hover:bg-brand-purple-hover",
  },
  ready: {
    badge: "bg-orange-100 text-orange-900 ring-1 ring-orange-200",
    button: "bg-orange-500 text-white hover:bg-orange-600",
  },
  delivered: {
    badge: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
    button: "bg-emerald-500 text-white hover:bg-emerald-600",
  },
  cancelled: {
    badge: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
    button: "bg-rose-500 text-white hover:bg-rose-600",
  },
  closed: {
    badge: "bg-slate-200 text-slate-700 ring-1 ring-slate-300",
    button: "bg-slate-700 text-white hover:bg-slate-800",
  },
};

export const NEXT_ORDER_STATUS: Partial<
  Record<z.infer<typeof orderStatusSchema>, z.infer<typeof orderStatusSchema>>
> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};
