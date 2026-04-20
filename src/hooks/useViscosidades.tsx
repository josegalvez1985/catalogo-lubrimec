import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/config";

export interface Viscosidad {
  id_viscosidad: number;
  descripcion: string;
}

async function fetchViscosidades(): Promise<Viscosidad[]> {
  const url = `${API_BASE}/josegalvez/paginaweb/viscosidades`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, redirect: "follow" });
  if (!res.ok) throw new Error(`Fetch error ${res.status}`);
  const data = await res.json().catch(() => ({}));
  const pageItems: any[] = Array.isArray(data) ? data : data.items || [];
  return pageItems.map((item) => ({
    id_viscosidad: Number(item.id_viscosidad),
    descripcion: item.descripcion || "",
  }));
}

export function useViscosidades() {
  const query = useQuery({
    queryKey: ["viscosidades"],
    queryFn: fetchViscosidades,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    viscosidades: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? "Error al cargar viscosidades" : null,
  };
}
