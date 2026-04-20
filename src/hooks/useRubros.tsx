import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/config";
import RUBROS_FIXTURE from "@/data/rubros";

export interface Rubro {
  id_rubro: number;
  descripcion_rubro: string;
}

async function fetchRubros(): Promise<Rubro[]> {
  const all: Rubro[] = [];
  let url: string | null = `${API_BASE}/josegalvez/paginaweb/rubros`;
  while (url) {
    const res = await fetch(url, { headers: { Accept: "application/json" }, redirect: "follow" });
    if (!res.ok) throw new Error(`Fetch error ${res.status}`);
    const data = await res.json().catch(() => ({}));
    const pageItems = data.items || [];
    all.push(...pageItems);
    url = data.next?.$ref ?? null;
  }
  return all;
}

export function useRubros() {
  const query = useQuery({
    queryKey: ["rubros"],
    queryFn: fetchRubros,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    rubros: query.data ?? (query.isError ? RUBROS_FIXTURE : []),
    loading: query.isLoading,
    error: query.isError ? "Error al cargar rubros (usando datos locales)" : null,
  };
}
