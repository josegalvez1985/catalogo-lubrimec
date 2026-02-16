import { useEffect, useState } from "react";

export interface Rubro {
  id_rubro: number;
  descripcion_rubro: string;
}

export function useRubros() {
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://oracleapex.com/ords/josegalvez/paginaweb/rubros")
      .then((res) => res.json())
      .then((data) => {
        setRubros(data.items);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar rubros");
        setLoading(false);
      });
  }, []);

  return { rubros, loading, error };
}
