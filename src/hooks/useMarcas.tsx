import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/config";

export interface Marca {
  id_marca: number;
  descripcion_marca: string;
}

async function fetchMarcas(): Promise<Marca[]> {
  const all: Marca[] = [];
  let url: string | null = `${API_BASE}/josegalvez/paginaweb/marcas`;
  while (url) {
    const res = await fetch(url, { headers: { Accept: "application/json" }, redirect: "follow" });
    if (!res.ok) throw new Error(`Fetch error ${res.status}`);
    const data = await res.json().catch(() => ({}));
    const pageItems: any[] = Array.isArray(data) ? data : data.items || [];
    for (const item of pageItems) {
      all.push({
        id_marca: Number(item.id_marca),
        descripcion_marca: item.descripcion_marca || item.descripcion || "",
      });
    }
    url = data.next?.$ref ?? null;
  }
  return all;
}

export function useMarcas() {
  const query = useQuery({
    queryKey: ["marcas"],
    queryFn: fetchMarcas,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    marcas: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? "Error al cargar marcas" : null,
  };
}
