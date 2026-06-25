// Caché en memoria de imágenes para la sesión actual.
//
// La primera vez que se pide una URL se descarga una sola vez y el
// HTMLImageElement decodificado queda guardado en memoria. Las llamadas
// posteriores (copiar / descargar, catálogo o cotizador) reutilizan ese
// mismo elemento sin volver a consultar al backend.
//
// No usa localStorage ni Service Worker: el caché vive solo mientras la
// pestaña esté abierta y se limpia al recargar, respetando el diseño
// "datos frescos al navegar". No altera la calidad ni el tamaño de las
// imágenes: guarda el binario original tal cual lo sirve el backend.

const cache = new Map<string, Promise<HTMLImageElement | null>>();

function fetchImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Devuelve la imagen de `url` desde el caché en memoria; si no está, la
 * descarga una sola vez y la guarda. Devuelve `null` si la carga falla.
 *
 * Se cachea la promesa (no solo el resultado) para que peticiones
 * concurrentes de la misma URL compartan una única descarga.
 */
export function loadCachedImage(url: string): Promise<HTMLImageElement | null> {
  const existing = cache.get(url);
  if (existing) return existing;

  const promise = fetchImage(url).then((img) => {
    // Si falló, no dejamos el null cacheado: permitir reintento posterior.
    if (img === null) cache.delete(url);
    return img;
  });

  cache.set(url, promise);
  return promise;
}
