// Centralizar la base URL de la API para poder cambiar backend fácilmente.
// En desarrollo usamos el proxy de Vite por defecto (`/ords`) para evitar CORS;
// en producción apuntamos al backend real de Oracle APEX.
const DEFAULT_BASE = import.meta.env.MODE === "development" ? "/ords" : "https://oracleapex.com/ords";

export const API_BASE = (import.meta.env.VITE_API_BASE as string) || DEFAULT_BASE;

// Uso ejemplo:
// fetch(`${API_BASE}/josegalvez/paginaweb/articulos`)
