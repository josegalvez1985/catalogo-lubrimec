import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";

export interface Articulo {
  id_articulo: number;
  descripcion_articulo: string;
  id_rubro?: number;
  imagen?: string;
}

export function useArticulos() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all: any[] = [];
        let url: string | null = `${API_BASE}/josegalvez/paginaweb/articulos`;
        while (url) {
          const res = await fetch(url);
          if (!res.ok) {
            const text = await res.text().catch(() => null);
            const headersObj: Record<string, string> = {};
            try {
              for (const [k, v] of res.headers.entries()) headersObj[k] = v;
            } catch (e) {
              /* ignore */
            }
            console.error("useArticulos - fetch error", { url, status: res.status, statusText: res.statusText, headers: headersObj, body: text });
            throw new Error(`Fetch error ${res.status}`);
          }
          const data = await res.json();
          const pageItems = data.items || [];
          // map fields
          for (const it of pageItems) {
            const rawIdRubro = it.id_rubro ?? it.ID_RUBRO ?? it.rubro_id ?? it.idrubro ?? it.id_rub ?? it.id_rub__c ?? null;
            const id_rubro = rawIdRubro != null ? Number(rawIdRubro) : null;
            const rawImagen = it.archivo_imagen || it.archivo || it.imagen || it.imagen_url || it.foto || null;
            const mime = (it.mime_type || it.MIME_TYPE || it.mimetype) ?? 'image/jpeg';
            // Detectar si la API devuelve: data URI completo, payload base64, URL absoluta o nada.
            let imagen: string | null = null;
            if (rawImagen && typeof rawImagen === 'string') {
              const s = rawImagen.trim();
              if (s.startsWith('data:')) {
                // ya es un data URI completo
                imagen = s;
              } else if (/^[A-Za-z0-9+\/=\s]+$/.test(s) && s.length > 100) {
                // parece ser un payload base64 -> construir data URI usando mime
                imagen = `data:${mime};base64,${s}`;
              } else if (s.startsWith('http')) {
                // URL absoluta
                imagen = s;
              } else if (it.id_articulo) {
                // puede ser nombre de archivo o relativo: usar endpoint que sirve imagen
                imagen = `${API_BASE}/josegalvez/paginaweb/articulos/${it.id_articulo}/imagen`;
              } else {
                imagen = null;
              }
            } else if (it.id_articulo) {
              imagen = `${API_BASE}/josegalvez/paginaweb/articulos/${it.id_articulo}/imagen`;
            } else {
              imagen = null;
            }

            all.push({
              id_articulo: it.id_articulo,
              descripcion_articulo: it.descripcion_articulo,
              id_rubro,
              imagen,
            });
          }
          // follow pagination if provided
          const nextRef = data.next && data.next.$ref ? data.next.$ref : null;
          url = nextRef;
        }
        if (!cancelled) {
          setArticulos(all);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Error al cargar articulos");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { articulos, loading, error };
}
