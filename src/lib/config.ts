// Centralizar la base URL de la API para poder cambiar backend fácilmente.
// En desarrollo usamos el proxy de Vite por defecto (`/ords`) para evitar CORS;
// en producción apuntamos al backend real de Oracle APEX.
const DEFAULT_BASE = import.meta.env.MODE === "development" ? "/ords" : "https://oracleapex.com/ords";

export const API_BASE = (import.meta.env.VITE_API_BASE as string) || DEFAULT_BASE;

export const WHATSAPP_NUMBER = "595974759037";

// Descuento fijo sobre el precio de lista. Lo usan el catálogo y el cotizador;
// el usuario no puede modificarlo.
export const DESCUENTO_PORCENTAJE = 40;

// Descuento de la página mayorista. Hoy coincide con el minorista, pero se
// declara aparte para poder moverlo sin tocar el precio del catálogo.
export const DESCUENTO_MAYORISTA = 40;
