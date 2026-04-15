import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";

export interface Viscosidad {
  id_viscosidad: number;
  descripcion: string;
}

export function useViscosidades() {
  const [viscosidades, setViscosidades] = useState<Viscosidad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `${API_BASE}/josegalvez/paginaweb/viscosidades`;
        const res = await fetch(url, { headers: { Accept: "application/json" }, redirect: "follow" });
        if (!res.ok) {
          throw new Error(`Fetch error ${res.status}`);
        }

        let data: any;
        try {
          data = await res.json();
        } catch (e) {
          data = {};
        }

        const pageItems: any[] = Array.isArray(data) ? data : data.items || [];
        const normalized: Viscosidad[] = pageItems.map((item) => ({
          id_viscosidad: typeof item.id_viscosidad === 'number' ? item.id_viscosidad : Number(item.id_viscosidad),
          descripcion: item.descripcion || "",
        }));

        if (!cancelled) {
          setViscosidades(normalized);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Error al cargar viscosidades');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { viscosidades, loading, error };
}
