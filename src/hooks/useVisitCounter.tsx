import { useEffect, useState } from "react";

// Contador de visitas con servicio gratuito externo (counterapi.dev).
// Incrementa una vez por sesión; en visitas posteriores solo lee el total.
const NAMESPACE = "lubrimec";
const KEY = "visitas";
const BASE = `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}`;

export function useVisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const yaContado = sessionStorage.getItem("visit_counted") === "1";
    const url = yaContado ? BASE : `${BASE}/up`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.count === "number") setCount(data.count);
        if (!yaContado) sessionStorage.setItem("visit_counted", "1");
      })
      .catch(() => setCount(null));
  }, []);

  return count;
}
