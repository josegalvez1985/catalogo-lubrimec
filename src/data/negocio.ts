// Datos del negocio que se muestran en más de un lugar: las páginas de
// Contacto y Servicios, y la guía que se le manda al asistente
// (src/lib/asistente.ts). Al cambiar un horario o un precio acá, cambia en
// todos lados.

export const TELEFONO = "+595 974 759 037";
export const DIRECCION = "Capiatá, Ruta 2 Km 20";

// `short`: como se muestra en el footer (sin los días cerrados).
export const HORARIOS = [
  { day: "Lunes – Viernes", short: "Lun – Vie", time: "08:00 – 18:00" },
  { day: "Sábado", short: "Sáb", time: "08:00 – 12:00" },
  { day: "Domingo", short: "Dom", time: "Cerrado", closed: true },
];

export const PREGUNTAS_FRECUENTES = [
  {
    q: "¿Necesito agendar turno?",
    a: "Recomendamos agendar para evitar esperas, pero también atendemos por orden de llegada. Podés escribirnos por WhatsApp para coordinar.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos efectivo, transferencia bancaria y tarjetas de débito/crédito. Consultá por opciones de financiación para servicios mayores.",
  },
  {
    q: "¿Trabajan con todas las marcas de vehículos?",
    a: "Sí, trabajamos con todas las marcas y modelos: autos, motos, pickups, 4x4, utilitarios y camiones livianos.",
  },
  {
    q: "¿Cuánto tarda un cambio de aceite?",
    a: "Aproximadamente 30 minutos. Si querés agregar más servicios (filtros, líquidos), el tiempo puede extenderse hasta 1 hora.",
  },
  {
    q: "¿Dan garantía por los trabajos?",
    a: "Sí, todos nuestros servicios cuentan con garantía. Te explicamos los términos al momento de coordinar el servicio.",
  },
  {
    q: "¿Puedo llevar mi propio aceite o filtro?",
    a: "Sí, podés llevar productos propios. Solo cobramos la mano de obra del servicio. Nos asesoramos sobre la calidad del producto antes.",
  },
];

export type ServicioId = "aceite" | "filtros" | "preventivo" | "revision" | "liquidos" | "asesoria";

export const SERVICIOS: {
  id: ServicioId;
  title: string;
  desc: string;
  includes: string[];
  /** Precio "desde", en guaraníes, ya formateado. "0" es sin costo. */
  priceFrom: string;
}[] = [
  {
    id: "aceite",
    title: "Cambio de aceite",
    desc: "Cambio rápido y profesional con aceites mineral, semisintético o sintético según las recomendaciones del fabricante de tu vehículo.",
    includes: [
      "Drenaje completo del aceite usado",
      "Cambio de filtro de aceite",
      "Verificación de niveles",
      "Limpieza del cárter",
    ],
    priceFrom: "120.000",
  },
  {
    id: "filtros",
    title: "Cambio de filtros",
    desc: "Reemplazo de filtros de aire, combustible y habitáculo. Mantenimiento esencial para el rendimiento del motor y la calidad del aire.",
    includes: [
      "Filtro de aire del motor",
      "Filtro de combustible",
      "Filtro de habitáculo (polen)",
      "Filtro de aceite",
    ],
    priceFrom: "35.000",
  },
  {
    id: "preventivo",
    title: "Mantenimiento preventivo",
    desc: "Plan integral según kilometraje y tipo de vehículo. Detectamos a tiempo problemas antes de que se vuelvan costosos.",
    includes: [
      "Revisión general del vehículo",
      "Cambio de aceite y filtros",
      "Verificación de líquidos",
      "Inspección visual de componentes",
    ],
    priceFrom: "200.000",
  },
  {
    id: "revision",
    title: "Revisión técnica",
    desc: "Diagnóstico completo del estado de tu vehículo. Te entregamos un reporte detallado con recomendaciones.",
    includes: [
      "Revisión de frenos y suspensión",
      "Estado de neumáticos",
      "Sistema eléctrico básico",
      "Reporte escrito",
    ],
    priceFrom: "80.000",
  },
  {
    id: "liquidos",
    title: "Cambio de líquidos",
    desc: "Renovación de líquidos esenciales: frenos, refrigerante, dirección hidráulica y caja de cambios.",
    includes: [
      "Líquido de frenos",
      "Refrigerante / Anticongelante",
      "Líquido de dirección",
      "Aceite de caja",
    ],
    priceFrom: "50.000",
  },
  {
    id: "asesoria",
    title: "Asesoría técnica",
    desc: "Te ayudamos a elegir los productos correctos para tu vehículo. Sin compromiso, con honestidad.",
    includes: [
      "Recomendación de aceite ideal",
      "Selección de filtros",
      "Consejos de mantenimiento",
      "Consulta sin costo",
    ],
    priceFrom: "0",
  },
];
