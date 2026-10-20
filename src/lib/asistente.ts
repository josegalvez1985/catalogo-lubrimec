/**
 * El asistente del sitio: un chat en un botón flotante, en todas las páginas.
 * Contrato del backend: sql/asistente.sql.
 *
 * La IA corre en Oracle (PKG_PW_IA, que llama a la API de Claude): la clave
 * nunca llega al navegador. Acá solo se manda la pregunta con lo que el
 * backend no sabe —la conversación, la página abierta, el descuento vigente y
 * la guía del sitio— y se muestra la respuesta.
 *
 * - La IA no ve tablas ni escribe SQL: solo tiene búsquedas fijas que
 *   devuelven registros del catálogo (productos, precios, stock, repuestos
 *   por vehículo).
 * - No hay usuarios: cada dispositivo (navegador) lleva un id anónimo
 *   (`DISPOSITIVO_KEY`) y tiene 30 preguntas por día. El backend tiene además
 *   un tope total por día.
 * - La conversación vive solo en memoria: recargar la página la borra.
 */

import { useSyncExternalStore } from "react";

import { API_BASE, DESCUENTO_MAYORISTA, DESCUENTO_PORCENTAJE, WHATSAPP_NUMBER } from "@/lib/config";
import { DIRECCION, HORARIOS, PREGUNTAS_FRECUENTES, SERVICIOS, TELEFONO } from "@/data/negocio";

export const ASISTENTE_URL = `${API_BASE}/josegalvez/paginaweb/asistente`;
export const DISPOSITIVO_KEY = "lubrimec_dispositivo";

export type MensajeIA = {
  id: string;
  rol: "usuario" | "asistente";
  texto: string;
  /** Un fallo (sin respuesta): no se le manda a la IA como historial. */
  error?: boolean;
};

type Estado = {
  mensajes: MensajeIA[];
  /** Esperando la respuesta (puede tardar: la IA busca en el catálogo). */
  pendiente: boolean;
  usadasHoy: number | null;
  limite: number | null;
  /** El panel abierto. Acá y no en el componente: sigue abierto al navegar. */
  abierto: boolean;
};

const VACIO: Estado = {
  mensajes: [],
  pendiente: false,
  usadasHoy: null,
  limite: null,
  abierto: false,
};

/* -------------------------------------------------------------------------- */
/* La conversación: un store de módulo                                         */
/* -------------------------------------------------------------------------- */

// De módulo y no en un componente: el chat sobrevive a la navegación y una
// respuesta que llega con el panel cerrado no se pierde.
let estado: Estado = VACIO;
const oyentes = new Set<() => void>();

function fijar(parcial: Partial<Estado>) {
  estado = { ...estado, ...parcial };
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => oyentes.delete(f);
}

const leer = () => estado;

export function useAsistente() {
  return useSyncExternalStore(suscribir, leer, leer);
}

export function abrirAsistente(abierto: boolean) {
  fijar({ abierto });
}

export function nuevaConversacion() {
  if (estado.pendiente) return;
  fijar({ mensajes: [] });
}

/** Para los tests. */
export function reiniciarAsistente() {
  estado = VACIO;
  oyentes.forEach((f) => f());
}

let secuencia = 0;
const nuevoId = () => `m${Date.now()}-${++secuencia}`;

/** Cuántos mensajes previos viajan como contexto (el backend corta en 8). */
const HISTORIAL = 8;

/** Id anónimo del dispositivo, para el límite por día. Sin storage, uno por carga. */
let dispositivoEnMemoria: string | null = null;
function dispositivo(): string {
  try {
    let id = localStorage.getItem(DISPOSITIVO_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DISPOSITIVO_KEY, id);
    }
    return id;
  } catch {
    dispositivoEnMemoria ??= `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return dispositivoEnMemoria;
  }
}

/**
 * Manda una pregunta y agrega la respuesta (o el error) a la conversación.
 * `pantalla`: la página abierta, para "¿cómo uso esta página?".
 */
export async function preguntar(texto: string, pantalla: string) {
  const pregunta = texto.trim();
  if (!pregunta || estado.pendiente) return;

  const historial = estado.mensajes
    .filter((m) => !m.error)
    .slice(-HISTORIAL)
    .map((m) => ({ rol: m.rol, texto: m.texto }));

  fijar({
    mensajes: [...estado.mensajes, { id: nuevoId(), rol: "usuario", texto: pregunta }],
    pendiente: true,
  });

  try {
    // text/plain y sin headers propios: es una petición "simple" para CORS,
    // así el navegador no manda preflight OPTIONS a ORDS (igual que visitas).
    const res = await fetch(ASISTENTE_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      cache: "no-store",
      body: JSON.stringify({
        pregunta,
        historial,
        pantalla,
        dispositivo: dispositivo(),
        descuento: DESCUENTO_PORCENTAJE,
        guia: armarGuia(),
      }),
    });
    const r = (await res.json().catch(() => ({}))) as {
      respuesta?: string;
      usadas_hoy?: number;
      limite?: number;
      message?: string;
    };
    if (!res.ok) {
      throw new Error(r.message || "El asistente no está disponible en este momento. Probá en un rato.");
    }
    fijar({
      mensajes: [...estado.mensajes, { id: nuevoId(), rol: "asistente", texto: String(r.respuesta ?? "") }],
      usadasHoy: r.usadas_hoy ?? null,
      limite: r.limite ?? null,
    });
  } catch (e) {
    const texto =
      e instanceof TypeError
        ? "No se pudo conectar con el asistente. Revisá tu conexión y probá de nuevo."
        : e instanceof Error
          ? e.message
          : "No se pudo obtener la respuesta.";
    fijar({ mensajes: [...estado.mensajes, { id: nuevoId(), rol: "asistente", texto, error: true }] });
  } finally {
    fijar({ pendiente: false });
  }
}

/** Vuelve a mandar la última pregunta que falló. */
export function reintentar(pantalla: string) {
  const { mensajes, pendiente } = estado;
  const ultimo = mensajes[mensajes.length - 1];
  const pregunta = mensajes[mensajes.length - 2];
  if (pendiente || !ultimo?.error || pregunta?.rol !== "usuario") return;
  fijar({ mensajes: mensajes.slice(0, -2) });
  void preguntar(pregunta.texto, pantalla);
}

/* -------------------------------------------------------------------------- */
/* La guía del sitio                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Lo que la IA sabe del negocio y de cómo se usa el sitio. Se arma con los
 * mismos datos que muestran Contacto y Servicios (src/data/negocio.ts), así
 * que un cambio de horario o de precio llega con el deploy, sin tocar Oracle.
 * Tiene que salir igual en cada pregunta: el backend la cachea.
 */
export function armarGuia(): string {
  const horarios = HORARIOS.map((h) => `- ${h.day}: ${h.time}`).join("\n");
  const servicios = SERVICIOS.map(
    (s) =>
      `- **${s.title}** (${s.priceFrom === "0" ? "sin costo" : `desde Gs. ${s.priceFrom}`}): ${s.desc} Incluye: ${s.includes.join(", ")}.`,
  ).join("\n");
  const faq = PREGUNTAS_FRECUENTES.map((f) => `- ${f.q} ${f.a}`).join("\n");

  return `## El negocio

LUBRIMEC es un lubricentro en ${DIRECCION} (Paraguay): venta de aceites, filtros, grasas y líquidos automotrices, y servicio de cambio de aceite y mantenimiento.

- WhatsApp y teléfono: ${TELEFONO} (https://wa.me/${WHATSAPP_NUMBER}). Es el canal para pedidos, turnos y consultas.
- Cómo llegar: https://maps.app.goo.gl/yvJk2A8PbadJKpwQ7

Horarios:
${horarios}

## Servicios del taller

Precios orientativos ("desde"); el precio final depende del vehículo y de los productos.

${servicios}

## Preguntas frecuentes

${faq}

## Las páginas del sitio

- [Catálogo](/catalogo): todos los productos con precio y stock. Se busca por texto y se filtra por rubro, marca y viscosidad. Un enlace a /catalogo?q=texto abre el catálogo ya buscando ese texto. Tocar un producto abre su detalle; "Agregar" lo suma al carrito.
- Todos los precios del catálogo tienen ${DESCUENTO_PORCENTAJE}% de descuento sobre el precio de lista (se muestran los dos).
- [Carrito](/carrito): el pedido armado desde el catálogo. "Enviar por WhatsApp" manda el pedido a LUBRIMEC, que confirma disponibilidad y coordina la entrega o el retiro. No hay pago en línea.
- [Cotizador](/cotizador): se elige el vehículo, la viscosidad y la marca del aceite, y los filtros; arma la cotización del cambio de aceite con filtros incluidos, que se descarga como imagen o se envía por WhatsApp.
- [Pedido mayorista](/mayorista): para compras por volumen. Lista compacta: se toca el producto y se escribe la cantidad; el pedido se descarga, se copia o se envía por WhatsApp. Descuento mayorista: ${DESCUENTO_MAYORISTA}%. Se puede pedir más que el stock: se confirma por WhatsApp.
- [Servicios](/servicios), [Nosotros](/nosotros) y [Contacto](/contacto) (formulario que abre WhatsApp, mapa y preguntas frecuentes).
- El stock que muestra el sitio es una referencia: la disponibilidad final se confirma por WhatsApp.`;
}
