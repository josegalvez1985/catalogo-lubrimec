import { useEffect, useState } from "react";

export interface Articulo {
  id_articulo: number;
  descripcion_articulo: string;
  id_rubro?: number | null;
  imagen?: string | null;
}

// Este hook ya no realiza llamadas remotas a la API de articulos ni a articulosimg.
// Devuelve un arreglo vacío para evitar solicitudes 500 desde el frontend.
export function useArticulos() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setArticulos([]);
    setLoading(false);
    setError(null);
  }, []);

  return { articulos, loading, error };
}
