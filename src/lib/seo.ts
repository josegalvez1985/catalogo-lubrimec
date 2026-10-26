// Título y descripción de cada página, tal como aparecen en Google.
// Lo usan dos lados:
//  - vite.config.ts, al compilar, genera un HTML por ruta (dist/catalogo.html,
//    etc.) con estas etiquetas, para que GitHub Pages responda 200 y Google
//    lea el título correcto sin ejecutar JS.
//  - <SeoMeta /> (App.tsx) las actualiza al navegar dentro de la SPA.
// Por eso este archivo no puede importar nada de React ni alias "@/".

export const SITE_URL = "https://www.lubrimec.shop";

export interface PageMeta {
  title: string;
  description: string;
  /** Páginas personales (carrito) que no tienen sentido en Google. */
  noindex?: boolean;
}

// Google corta el título en ~60 caracteres y la descripción en ~155.
export const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "Lubrimec | Lubricentro en San Lorenzo – Aceites y Filtros",
    description:
      "Lubricentro en San Lorenzo, sobre Tte. Benítez. Aceites, filtros, grasas y cambio de aceite para tu vehículo. Mirá precios y stock en línea y pedí por WhatsApp.",
  },
  "/catalogo": {
    title: "Catálogo de aceites, filtros y lubricantes | Lubrimec",
    description:
      "Precios y stock actualizados de aceites de motor, filtros, grasas y líquidos automotrices. Filtrá por marca, rubro y viscosidad y pedí por WhatsApp.",
  },
  "/cotizador": {
    title: "Cotizador de cambio de aceite y filtros | Lubrimec",
    description:
      "Elegí tu vehículo y obtené al instante la cotización del cambio de aceite con filtros incluidos. Enviala por WhatsApp a Lubrimec, San Lorenzo.",
  },
  "/mayorista": {
    title: "Pedidos mayoristas de lubricantes y filtros | Lubrimec",
    description:
      "Armá tu pedido por volumen de aceites, filtros y lubricantes con precio mayorista, revisá el stock y envialo por WhatsApp a Lubrimec.",
  },
  "/servicios": {
    title: "Servicios de lubricentro en San Lorenzo | Lubrimec",
    description:
      "Cambio de aceite y filtros, mantenimiento preventivo, cambio de líquidos y asesoría técnica para tu vehículo en San Lorenzo, Paraguay.",
  },
  "/nosotros": {
    title: "Nosotros | Lubrimec, lubricentro en San Lorenzo",
    description:
      "Conocé a Lubrimec: lubricentro de San Lorenzo especializado en lubricantes, filtros y mantenimiento automotriz con atención personalizada.",
  },
  "/contacto": {
    title: "Contacto y ubicación | Lubrimec San Lorenzo",
    description:
      "Encontranos en Tte. Benítez, San Lorenzo. Escribinos por WhatsApp al +595 974 759 037, mirá los horarios de atención y cómo llegar.",
  },
  "/carrito": {
    title: "Mi pedido | Lubrimec",
    description: "Revisá los productos de tu pedido y envialo por WhatsApp a Lubrimec.",
    noindex: true,
  },
};

export const NOT_FOUND_META: PageMeta = {
  title: "Página no encontrada | Lubrimec",
  description: PAGE_META["/"].description,
  noindex: true,
};

export function canonicalUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Reescribe en el HTML de index.html las etiquetas que cambian por página. */
export function applyMetaToHtml(html: string, path: string, meta: PageMeta): string {
  const title = escapeAttr(meta.title);
  const description = escapeAttr(meta.description);
  const url = canonicalUrl(path);
  const setContent = (attr: string, value: string) => (doc: string) =>
    doc.replace(new RegExp(`(<meta ${attr} content=")[^"]*(")`), `$1${value}$2`);

  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  out = [
    setContent('name="description"', description),
    setContent('property="og:title"', title),
    setContent('property="og:description"', description),
    setContent('property="og:url"', url),
    setContent('name="twitter:title"', title),
    setContent('name="twitter:description"', description),
  ].reduce((doc, fn) => fn(doc), out);
  out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  if (meta.noindex) {
    out = out.replace("</head>", '  <meta name="robots" content="noindex" />\n  </head>');
  }
  return out;
}
