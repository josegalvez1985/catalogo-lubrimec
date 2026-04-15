import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import { useRubros, Rubro } from "./useRubros";

export interface Articulo {
  id_articulo: number;
  descripcion_articulo: string;
  id_rubro?: number | null;
  descripcion_rubro?: string | null;
  id_marca?: number | null;
  descripcion_marca?: string | null;
  id_viscosidad?: number | null;
  moto_caja?: string | null;
  tiene_imagen?: number;
  stock?: number | null;
  precio?: number | null;
}

// Hook que consulta la API de articulos (sin imagenes) y filtra por rubro.
// Si se pasa `rubroId`, devuelve solo articulos de ese rubro.
// Ademas filtra articulos cuyo `id_rubro` no exista en la lista de rubros remota.
export function useArticulos(rubroId?: number | null) {
  const { rubros } = useRubros();
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all: Articulo[] = [];
        // Enviar parametros por defecto cod_empresa=24 y es_activo=N (GET)
        const params = new URLSearchParams({ cod_empresa: '24', es_activo: 'N' });
        let url: string | null = `${API_BASE}/josegalvez/paginaweb/articulossinimg?${params.toString()}`;
        while (url) {
          const res = await fetch(url, { headers: { Accept: "application/json" }, redirect: "follow" });
          if (!res.ok) {
            const text = await res.text().catch(() => null);
            const headersObj: Record<string, string> = {};
            try {
              for (const [k, v] of res.headers.entries()) headersObj[k] = v;
            } catch (e) {
              /* ignore */
            }
            const errorDetail = { url, status: res.status, statusText: res.statusText, headers: headersObj, body: text, timestamp: new Date().toISOString(), endpoint: 'articulossinimg' };
            try { localStorage.setItem('api_error_log', JSON.stringify(errorDetail)); } catch (e) { /* ignore storage errors */ }
            console.error(`useArticulos - fetch error ${res.status} ${res.statusText} ${url}\nHeaders: ${JSON.stringify(headersObj)}\nBody: ${text}`);
            throw new Error(`Fetch error ${res.status}`);
          }

          let data: any;
          try {
            data = await res.json();
          } catch (e) {
            const fallbackText = await res.text().catch(() => null);
            console.warn('useArticulos - response not JSON', { url, fallbackText });
            data = {};
          }

          // manejar distintos formatos: { items: [...] } o [] directamente
          const pageItems: any[] = Array.isArray(data) ? data : (data.items || []);
          for (const it of pageItems) {
            // Normalizar la respuesta: la API devuelve `descripcion`, mapeamos a `descripcion_articulo`
            const mapped: any = {
              ...it,
              id_articulo: typeof it.id_articulo === 'number' ? it.id_articulo : Number(it.id_articulo),
              descripcion_articulo: it.descripcion || it.descripcion_articulo || "",
              id_viscosidad: typeof it.id_viscosidad === 'number' ? it.id_viscosidad : it.id_viscosidad ? Number(it.id_viscosidad) : null,
              moto_caja: it.moto_caja ?? it.motor_caja ?? null,
              tiene_imagen: it.tiene_imagen ?? 0,
            };
            all.push(mapped);
          }

          const nextRef = data.next && data.next.$ref ? data.next.$ref : null;
          url = nextRef;
        }

        if (!cancelled) {
          // Si tenemos la lista de rubros, filtrar para incluir solo articulos con id_rubro valido
          const validRubroIds = Array.isArray(rubros) ? rubros.map((r: Rubro) => r.id_rubro) : [];
          let filtered = all.filter(a => a && (a.id_rubro == null ? false : validRubroIds.length ? validRubroIds.includes(a.id_rubro) : true));
          if (typeof rubroId === 'number') filtered = filtered.filter(a => a.id_rubro === rubroId);
          setArticulos(filtered);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          try {
            const caught = { message: String(err), stack: (err as any)?.stack || null, timestamp: new Date().toISOString(), context: 'useArticulos' };
            localStorage.setItem('api_error_log', JSON.stringify(caught));
          } catch (e) { /* ignore */ }
          setError('Error al cargar articulos');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [rubroId, JSON.stringify(rubros)]);

  return { articulos, loading, error };
}
