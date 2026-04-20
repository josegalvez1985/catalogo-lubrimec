import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/config";
import { useRubros, type Rubro } from "./useRubros";

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

async function fetchArticulos(): Promise<Articulo[]> {
  const all: Articulo[] = [];
  const params = new URLSearchParams({ cod_empresa: "24", es_activo: "N" });
  let url: string | null = `${API_BASE}/josegalvez/paginaweb/articulossinimg?${params.toString()}`;
  while (url) {
    const res = await fetch(url, { headers: { Accept: "application/json" }, redirect: "follow" });
    if (!res.ok) throw new Error(`Fetch error ${res.status}`);
    const data = await res.json().catch(() => ({}));
    const pageItems: any[] = Array.isArray(data) ? data : (data.items || []);
    for (const it of pageItems) {
      all.push({
        ...it,
        id_articulo: Number(it.id_articulo),
        descripcion_articulo: it.descripcion || it.descripcion_articulo || "",
        id_viscosidad: it.id_viscosidad ? Number(it.id_viscosidad) : null,
        moto_caja: it.moto_caja ?? it.motor_caja ?? null,
        tiene_imagen: it.tiene_imagen ?? 0,
      });
    }
    url = data.next?.$ref ?? null;
  }
  return all;
}

export function useArticulos() {
  const { rubros } = useRubros();

  const query = useQuery({
    queryKey: ["articulos"],
    queryFn: fetchArticulos,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const articulos = useMemo(() => {
    const all = query.data ?? [];
    if (rubros.length === 0) return all;
    const validIds = new Set(rubros.map((r: Rubro) => r.id_rubro));
    return all.filter((a) => a.id_rubro != null && validIds.has(a.id_rubro));
  }, [query.data, rubros]);

  return {
    articulos,
    loading: query.isLoading,
    error: query.isError ? "Error al cargar articulos" : null,
  };
}
