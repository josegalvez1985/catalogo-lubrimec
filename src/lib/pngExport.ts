import { toBlob } from "html-to-image";

/**
 * Captura de un nodo del DOM a PNG, con los cuidados que hicieron falta para
 * que la imagen salga bien en todos los navegadores (ver comentarios abajo).
 *
 * Nació en QuotationModal (cotizador) y vive acá para que la lista mayorista
 * use exactamente el mismo motor en vez de una copia que se desincronice.
 */

/**
 * pixelRatio dinámico: maximiza la calidad sin superar los límites de canvas
 * del navegador (lado máx ~16384px y área máx ~256MP en iOS/Safari). Con muchos
 * objetos el nodo crece y un ratio fijo desbordaría el canvas, dejándolo en blanco.
 */
export function calcPixelRatio(node: HTMLElement): number {
  const { width, height } = node.getBoundingClientRect();
  if (!width || !height) return 2.5;

  const MAX_SIDE = 16384; // límite de ancho/alto de canvas
  // Tope de área según navegador: iOS/Safari limita el canvas a ~16MP; el resto
  // (Chrome/Edge/Firefox, desktop y Android) soporta mucho más, así una lista
  // larga mantiene el ratio alto y no sale pixelada.
  const ua = navigator.userAgent;
  const isIOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
  const MAX_AREA = isIOS || isSafari ? 16_000_000 : 64_000_000;
  const TARGET = 2.5; // calidad HD deseada

  const ratioBySide = Math.min(MAX_SIDE / width, MAX_SIDE / height);
  const ratioByArea = Math.sqrt(MAX_AREA / (width * height));

  // Nunca subir de TARGET ni bajar de 1 (mínimo aceptable). Redondeamos a 0.5
  // para evitar ratios fraccionarios raros (p. ej. 2.37) que suavizan bordes y
  // texto; un múltiplo de 0.5 mantiene la grilla de píxeles más nítida.
  const raw = Math.max(1, Math.min(TARGET, ratioBySide, ratioByArea));
  return Math.max(1, Math.floor(raw * 2) / 2);
}

/** Espera a que todas las imágenes del nodo terminen (carguen o fallen). */
async function esperarImagenes(node: HTMLElement, timeoutMs = 4000) {
  await Promise.all(
    Array.from(node.querySelectorAll("img")).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          const done = () => {
            img.removeEventListener("load", done);
            img.removeEventListener("error", done);
            resolve();
          };
          img.addEventListener("load", done);
          img.addEventListener("error", done);
          // Tope de seguridad: si una imagen nunca responde, no bloquear la captura.
          setTimeout(done, timeoutMs);
        })
    )
  );
}

export interface CapturaOpciones {
  /** Ancho fijo al que se renderiza el contenido durante la captura (px). */
  contentWidth?: number;
  /** Tope de ancho de la imagen final en px. Sin esto: máxima resolución. */
  anchoObjetivo?: number;
  /** En tema oscuro, forzar fondo negro puro y tarjetas negras. */
  negroEnOscuro?: boolean;
  /** Se ejecuta antes de medir (p. ej. activar el layout de captura). */
  onAntes?: () => void;
  /** Se ejecuta siempre al terminar, aunque falle. */
  onDespues?: () => void;
}

/**
 * Renderiza `node` a un PNG. Devuelve null si el nodo no existe.
 *
 * Restaura siempre los estilos que toca, así la vista en pantalla no queda
 * alterada aunque la captura falle.
 */
export async function capturarNodoPng(
  node: HTMLElement | null,
  opciones: CapturaOpciones = {}
): Promise<Blob | null> {
  if (!node) return null;
  const { contentWidth, anchoObjetivo, negroEnOscuro = true, onAntes, onDespues } = opciones;

  // Activar el layout de captura y esperar a que React lo pinte antes de medir.
  onAntes?.();
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  // Asegurar que las fuentes estén listas antes de capturar: si html-to-image
  // mide el texto con la fuente aún cargando, la primera imagen puede salir con
  // métricas erróneas o texto recortado.
  if (document.fonts?.ready) await document.fonts.ready;

  // Sin esto la primera captura sale incompleta (imágenes aún cargando).
  await esperarImagenes(node);

  const isDark = document.documentElement.classList.contains("dark");
  const bg =
    negroEnOscuro && isDark
      ? "#000000"
      : getComputedStyle(node).backgroundColor || "#ffffff";

  // --- Ajustes de tamaño sólo durante la captura ---
  const prev = {
    width: node.style.width,
    boxSizing: node.style.boxSizing,
    backgroundColor: node.style.backgroundColor,
  };
  node.style.backgroundColor = bg;

  // En oscuro, forzar la variable --card a negro para que las tarjetas (bg-card)
  // también queden negras y no marrón oscuro. Se restaura al terminar.
  const forzarCardNegra = negroEnOscuro && isDark;
  const prevCardVar = node.style.getPropertyValue("--card");
  if (forzarCardNegra) node.style.setProperty("--card", "0 0% 0%");

  if (contentWidth) {
    const padL = parseFloat(getComputedStyle(node).paddingLeft) || 0;
    const padR = parseFloat(getComputedStyle(node).paddingRight) || 0;
    // El contenido se renderiza al ancho fijo (sin estirar filas ni dejar
    // márgenes). El alto queda automático según la cantidad de objetos.
    node.style.boxSizing = "border-box";
    node.style.width = `${contentWidth + padL + padR}px`;
  }

  // Forzar reflujo y medir el ancho final ya aplicado.
  const finalWidth = node.getBoundingClientRect().width || 1;
  const pixelRatio = anchoObjetivo
    ? Math.min(calcPixelRatio(node), anchoObjetivo / finalWidth)
    : calcPixelRatio(node);

  try {
    // Sin cacheBust para reutilizar la caché del navegador en vez de
    // re-descargar las imágenes desde la API.
    return await toBlob(node, { pixelRatio, backgroundColor: bg });
  } finally {
    node.style.width = prev.width;
    node.style.boxSizing = prev.boxSizing;
    node.style.backgroundColor = prev.backgroundColor;
    if (forzarCardNegra) {
      if (prevCardVar) node.style.setProperty("--card", prevCardVar);
      else node.style.removeProperty("--card");
    }
    onDespues?.();
  }
}

/** Dispara la descarga de un blob como archivo. */
export function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
