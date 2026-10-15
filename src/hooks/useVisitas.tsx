import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/config";

export interface Visitas {
  total: number;
}

// Una visita = una sesión del navegador (pestaña). Recargar o navegar entre
// páginas no vuelve a sumar; volver a abrir el sitio o abrirlo en otra pestaña, sí.
export const VISITA_SESSION_KEY = "lubrimec_visita_registrada";

function visitaYaRegistrada(): boolean {
  try {
    return sessionStorage.getItem(VISITA_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function marcarVisitaRegistrada() {
  try {
    sessionStorage.setItem(VISITA_SESSION_KEY, "1");
  } catch {
    // Sin sessionStorage (modo privado estricto) se cuenta en cada carga.
  }
}

async function fetchVisitas(): Promise<Visitas> {
  // Los navegadores automatizados (crawlers con headless Chrome) no suman.
  const registrar = !visitaYaRegistrada() && !navigator.webdriver;
  const params = new URLSearchParams({ cod_empresa: "24" });
  const url = `${API_BASE}/josegalvez/paginaweb/visitas?${params.toString()}`;

  // POST sin body y sólo con Accept: es una petición "simple" para CORS, así
  // el navegador no manda preflight OPTIONS a ORDS.
  const res = await fetch(url, {
    method: registrar ? "POST" : "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Fetch error ${res.status}`);
  if (registrar) marcarVisitaRegistrada();

  const data = await res.json();
  return { total: Number(data.total) || 0 };
}

export function useVisitas() {
  const query = useQuery({
    queryKey: ["visitas"],
    queryFn: fetchVisitas,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    visitas: query.data ?? null,
    loading: query.isLoading,
    error: query.isError ? "Error al cargar visitas" : null,
  };
}
