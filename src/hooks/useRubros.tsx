import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import RUBROS_FIXTURE from "@/data/rubros";

export interface Rubro {
  id_rubro: number;
  descripcion_rubro: string;
}

export function useRubros() {
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all: any[] = [];
        let url: string | null = `${API_BASE}/josegalvez/paginaweb/rubros`;
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
            const errorDetail = { url, status: res.status, statusText: res.statusText, headers: headersObj, body: text, timestamp: new Date().toISOString(), endpoint: 'rubros' };
            try { localStorage.setItem('api_error_log', JSON.stringify(errorDetail)); } catch (e) { /* ignore storage errors */ }
            console.error(`useRubros - fetch error ${res.status} ${res.statusText} ${url}\nHeaders: ${JSON.stringify(headersObj)}\nBody: ${text}`);
            throw new Error(`Fetch error ${res.status}`);
          }
          const data = await res.json();
          const pageItems = data.items || [];
          for (const it of pageItems) all.push(it);
          const nextRef = data.next && data.next.$ref ? data.next.$ref : null;
          url = nextRef;
        }
        if (!cancelled) {
          setRubros(all);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          try {
            const caught = { message: String(err), stack: (err as any)?.stack || null, timestamp: new Date().toISOString(), context: 'useRubros' };
            localStorage.setItem('api_error_log', JSON.stringify(caught));
          } catch (e) { /* ignore */ }
          // Fallback a datos locales para que la UI siga funcionando cuando la API remota falla
          try {
            setRubros(RUBROS_FIXTURE);
            setError("Error al cargar rubros (usando datos locales)");
          } catch (e) {
            setError("Error al cargar rubros");
          }
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rubros, loading, error };
}
