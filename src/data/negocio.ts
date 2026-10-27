// Datos del negocio que se muestran en más de un lugar: Contacto, el Footer y
// la guía que se le manda al asistente (src/lib/asistente.ts). Al cambiar un
// horario acá, cambia en todos lados.

export const TELEFONO = "+595 974 759 037";
export const DIRECCION = "Tte. Benítez, San Lorenzo";

// El pin del local en Google Maps. `MAPA_EMBED_URL` es el mismo punto para el
// iframe de Contacto (no necesita clave de API).
export const MAPA_URL = "https://maps.app.goo.gl/ToZGjqegY1xgszex7";
export const MAPA_EMBED_URL = "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s-25.3496494,-57.5109256!6i17";

// `short`: como se muestra en el footer (sin los días cerrados).
export const HORARIOS = [
  { day: "Lunes – Viernes", short: "Lun – Vie", time: "08:00 – 18:00" },
  { day: "Sábado", short: "Sáb", time: "08:00 – 12:00" },
  { day: "Domingo", short: "Dom", time: "Cerrado", closed: true },
];

// Por el momento solo venta: sin cambio de aceite ni otros servicios de taller.
export const PREGUNTAS_FRECUENTES = [
  {
    q: "¿Hacen cambio de aceite o colocación?",
    a: "Por el momento no: solo vendemos. Te ayudamos a elegir el aceite y los filtros correctos para tu vehículo.",
  },
  {
    q: "¿Cómo hago un pedido?",
    a: "Armá tu pedido en el catálogo (o en Pedido mayorista si comprás por volumen) y envialo por WhatsApp. Te confirmamos la disponibilidad y coordinamos la entrega o el retiro.",
  },
  {
    q: "¿El stock del sitio está actualizado?",
    a: "Es una referencia: la disponibilidad final te la confirmamos por WhatsApp al recibir el pedido.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos efectivo, transferencia bancaria y tarjetas de débito/crédito.",
  },
  {
    q: "¿Tienen productos para todas las marcas de vehículos?",
    a: "Sí, tenemos aceites y filtros para todas las marcas y modelos: autos, motos, pickups, 4x4, utilitarios y camiones livianos.",
  },
];
