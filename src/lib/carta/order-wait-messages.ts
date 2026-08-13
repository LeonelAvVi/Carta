import type { OrderStatus } from "@/lib/types";

/** Mensajes de espera en la carta pública (rotan ~cada 20 s). */
export const ORDER_WAIT_MESSAGES: Record<
  Exclude<OrderStatus, "cancelled" | "closed">,
  string[]
> = {
  pending: [
    "📩 ¡Pedido enviado! Ya llegó a la cocina.",
    "⏳ Un momentito… el local está revisando tu pedido.",
    "🛎️ Tranquilo, ya saben que estás en la mesa.",
    "✨ Gracias por pedir. Pronto te confirman.",
    "👀 Estamos avisando al equipo de tu pedido.",
    "💛 Pedido recibido. ¡La espera vale la pena!",
  ],
  confirmed: [
    "✅ ¡Confirmado! El local aceptó tu pedido.",
    "🙌 Todo listo para empezar a prepararlo.",
    "🔥 Buenas noticias: tu pedido ya está en marcha.",
    "🍽️ El equipo ya lo tiene apuntado.",
    "💫 Confirmado. Ahora pasa a cocina o barra.",
    "👏 ¡Genial! Tu pedido fue aceptado.",
  ],
  preparing: [
    "👨‍🍳 Están preparando tu pedido con cariño.",
    "🔥 Cocina/barra trabajando en lo tuyo.",
    "🌶️ Casi listo… se está cocinando la magia.",
    "⏱️ Un poquito más y estará para servir.",
    "🥘 Preparando cada detalle de tu pedido.",
    "💫 La espera corta, el sabor largo. ¡Ya falta poco!",
  ],
  ready: [
    "🎉 ¡Listo! Ya pueden llevarlo a tu mesa.",
    "🚀 Tu pedido está listo para entregar.",
    "👀 ¡Atento! En cualquier momento llega.",
    "🍽️ Todo preparado. Solo falta servirlo.",
    "✨ ¡Ya está! El equipo viene en camino.",
    "🥳 Pedido listo. ¡Buen provecho en segundos!",
  ],
  delivered: [
    "😋 ¡Ya está en tu mesa! Buen provecho.",
    "🥂 Disfrutá tu pedido. Si querés más, ¡pedí otra vez!",
    "💚 Servido. Que lo disfrutes mucho.",
    "🌟 Listo y entregado. ¡Gracias por elegir este lugar!",
    "🍽️ ¡A disfrutar! Estamos para lo que necesites.",
    "😊 Pedido entregado. ¡Que te quede rico!",
  ],
};

export type GuestWaitStatus = keyof typeof ORDER_WAIT_MESSAGES;

export function isGuestWaitStatus(
  status: string | null | undefined
): status is GuestWaitStatus {
  return (
    status === "pending" ||
    status === "confirmed" ||
    status === "preparing" ||
    status === "ready" ||
    status === "delivered"
  );
}

export const ORDER_WAIT_STATUS_LABELS: Record<GuestWaitStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  ready: "Listo",
  delivered: "Entregado",
};

export const CARTA_ORDER_PLACED_EVENT = "carta:order-placed";

export const ORDER_STATUS_POLL_MS = 12_000;
export const ORDER_MESSAGE_ROTATE_MS = 20_000;
