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
        let url: string | null = `${API_BASE}/josegalvez/paginaweb/articulossinimg`;
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
            let imagen: string | null = null;
            if (it.id_articulo) {
              try {
                const imgRes = await fetch(`${API_BASE}/josegalvez/paginaweb/articulosimg?id_articulo=${it.id_articulo}`);
                if (imgRes.ok) {
                  const imgData = await imgRes.json();
                  const imgItem = imgData.items && imgData.items[0];
                  if (imgItem && imgItem.content && imgItem.content_type) {
                    imagen = `data:${imgItem.content_type};base64,${imgItem.content}`;
                  }
                }
              } catch (e) {
                imagen = null;
              }
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
