import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/config";
import { useRubros, type Rubro } from "./useRubros";
import { useMarcas } from "./useMarcas";

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
  precioLista?: number | null;
  cantidad_vendida?: number | null;
  valoracion_marca?: number | null;
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
        descripcion_marca: it.marca || it.descripcion_marca || null,
        id_rubro: it.id_rubro != null ? Number(it.id_rubro) : null,
        id_marca: it.id_marca != null ? Number(it.id_marca) : null,
        id_viscosidad: it.id_viscosidad != null ? Number(it.id_viscosidad) : null,
        moto_caja: it.moto_caja ?? it.motor_caja ?? null,
        tiene_imagen: it.tiene_imagen ?? 0,
        stock: it.stock != null ? Number(it.stock) : null,
        precio: it.precio != null ? Number(it.precio) : null,
        cantidad_vendida: it.cantidad_vendida != null ? Number(it.cantidad_vendida) : null,
      });
    }
    url = data.next?.$ref ?? null;
  }
  return all;
}

export function useArticulos() {
  const { rubros } = useRubros();
  const { marcas } = useMarcas();

  const query = useQuery({
    queryKey: ["articulos"],
    queryFn: fetchArticulos,
    retry: 1,
  });

  const articulos = useMemo(() => {
    const all = query.data ?? [];
    const validRubroIds = rubros.length > 0 ? new Set(rubros.map((r: Rubro) => r.id_rubro)) : null;
    const marcaValoracion = new Map(marcas.map((m) => [m.id_marca, m.valoracion ?? null]));
    return all
      .filter((a) => validRubroIds == null || (a.id_rubro != null && validRubroIds.has(a.id_rubro)))
      .map((a) => ({
        ...a,
        valoracion_marca: a.id_marca != null ? (marcaValoracion.get(a.id_marca) ?? null) : null,
      }));
  }, [query.data, rubros, marcas]);

  return {
    articulos,
    loading: query.isLoading,
    error: query.isError ? "Error al cargar articulos" : null,
  };
}
