import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";

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
            console.error("useRubros - fetch error", { url, status: res.status, statusText: res.statusText, headers: headersObj, body: text });
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
          setError("Error al cargar rubros");
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
