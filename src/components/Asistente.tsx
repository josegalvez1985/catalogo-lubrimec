import { useLocation } from "react-router-dom";
import { AlertTriangle, ArrowUp, Check, Copy, RotateCcw, SquarePen, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { toast } from "sonner";

import { Markdown } from "@/components/Markdown";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import {
  abrirAsistente,
  nuevaConversacion,
  preguntar,
  reintentar,
  useAsistente,
  type MensajeIA,
} from "@/lib/asistente";
import { cn } from "@/lib/utils";

/**
 * El asistente: botón flotante y chat, en todas las páginas (lo monta
 * `App.tsx` si `ASISTENTE_HABILITADO`). Lógica y contrato en
 * `lib/asistente.ts`; el backend, `sql/asistente.sql`.
 *
 * | | Botón | Chat |
 * | --- | --- | --- |
 * | Celular (`< lg`) | abajo a la derecha (más arriba en /mayorista, por su barra) | hoja casi a pantalla completa |
 * | Escritorio (`≥ lg`) | abajo a la derecha | tarjeta flotante abajo a la derecha; sigue abierta al navegar |
 */
export function Asistente() {
  const { abierto, pendiente } = useAsistente();
  const escritorio = useEscritorio();
  const { pathname } = useLocation();

  return (
    <>
      {!(escritorio && abierto) && (
        <button
          type="button"
          onClick={() => abrirAsistente(true)}
          aria-label="Abrir el asistente"
          title="Asistente"
          className={cn(
            "fixed right-5 z-40 grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-amber-600 text-primary-foreground shadow-2xl shadow-primary/30 ring-1 ring-primary/20 transition-transform hover:scale-105 active:scale-95 lg:bottom-6",
            pathname === "/mayorista" ? "bottom-24" : "bottom-6",
          )}
        >
          <Sparkles className="size-6" />
          {pendiente && (
            <span className="absolute top-0.5 right-0.5 flex size-3.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-foreground/70" />
              <span className="relative inline-flex size-3.5 rounded-full border-2 border-primary-foreground bg-destructive" />
            </span>
          )}
        </button>
      )}

      {escritorio ? (
        abierto && (
          <aside
            aria-label="Asistente"
            className="animate-in slide-in-from-bottom-4 fade-in fixed right-6 bottom-6 z-[45] flex h-[min(640px,calc(100dvh-6rem))] w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl duration-200"
          >
            <PanelChat escritorio />
          </aside>
        )
      ) : (
        <Drawer open={abierto} onOpenChange={abrirAsistente} shouldScaleBackground={false}>
          <DrawerContent className="h-[92dvh] rounded-t-3xl border-border/60 lg:hidden">
            <DrawerTitle className="sr-only">Asistente</DrawerTitle>
            <DrawerDescription className="sr-only">
              Preguntá por productos, precios, stock o cómo usar el sitio
            </DrawerDescription>
            <PanelChat escritorio={false} />
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

/** `≥ lg`, el mismo corte que el menú del Navbar. */
function useEscritorio() {
  return useSyncExternalStore(
    (f) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", f);
      return () => mq.removeEventListener("change", f);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

/* -------------------------------------------------------------------------- */
/* El chat                                                                     */
/* -------------------------------------------------------------------------- */

const NOMBRE_PAGINA: Record<string, string> = {
  "/": "Inicio",
  "/nosotros": "Nosotros",
  "/servicios": "Servicios",
  "/catalogo": "Catálogo",
  "/cotizador": "Cotizador",
  "/mayorista": "Pedido mayorista",
  "/carrito": "Carrito",
  "/contacto": "Contacto",
};

/** La página abierta: el nombre (para la primera sugerencia) y lo que va a la IA. */
function usePaginaActual(): { nombre: string | null; texto: string } {
  const { pathname } = useLocation();
  const nombre = NOMBRE_PAGINA[pathname] ?? null;
  return { nombre, texto: nombre ? `${nombre} (${pathname})` : pathname };
}

function PanelChat({ escritorio }: { escritorio: boolean }) {
  const { mensajes, pendiente, usadasHoy, limite } = useAsistente();
  const pagina = usePaginaActual();
  const [texto, setTexto] = useState("");
  const lista = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLTextAreaElement>(null);

  // Siempre a la vista lo último: la pregunta recién mandada y la respuesta.
  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [mensajes.length, pendiente]);

  // En la computadora se escribe enseguida; en el celular no se abre el
  // teclado solo, que tapa la mitad de la hoja.
  useEffect(() => {
    if (escritorio) entrada.current?.focus();
  }, [escritorio]);

  // Escape cierra la tarjeta de la computadora (la hoja del celular ya lo hace).
  useEffect(() => {
    if (!escritorio) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") abrirAsistente(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [escritorio]);

  const enviar = (t = texto) => {
    if (!t.trim() || pendiente) return;
    void preguntar(t, pagina.texto);
    setTexto("");
    entrada.current?.style.removeProperty("height");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      enviar();
    }
  };

  // Un enlace al catálogo en el celular: se cierra la hoja para ver la página.
  const alNavegar = escritorio ? undefined : () => abrirAsistente(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-amber-600 text-primary-foreground">
          <Sparkles className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] leading-tight font-bold">Asistente Lubrimec</h2>
          <p className="truncate text-[11.5px] leading-tight text-muted-foreground">
            Productos, precios, stock y servicios
          </p>
        </div>
        {mensajes.length > 0 && (
          <button
            type="button"
            onClick={nuevaConversacion}
            disabled={pendiente}
            title="Nueva conversación"
            aria-label="Nueva conversación"
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted active:scale-95 disabled:opacity-40"
          >
            <SquarePen className="size-[18px]" />
          </button>
        )}
        <button
          type="button"
          onClick={() => abrirAsistente(false)}
          title="Cerrar"
          aria-label="Cerrar el asistente"
          className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted active:scale-95"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Conversación */}
      <div ref={lista} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {mensajes.length === 0 ? (
          <Bienvenida pagina={pagina.nombre} onElegir={enviar} />
        ) : (
          mensajes.map((m, i) => (
            <Mensaje
              key={m.id}
              m={m}
              ultimo={i === mensajes.length - 1}
              onReintentar={() => reintentar(pagina.texto)}
              onNavegar={alNavegar}
            />
          ))
        )}
        {pendiente && <Pensando />}
      </div>

      {/* Entrada */}
      <div className="border-t border-border/60 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15">
          <textarea
            ref={entrada}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              // Crece con el texto hasta unas 6 líneas.
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={1000}
            enterKeyHint="send"
            placeholder="Escribí tu pregunta…"
            aria-label="Tu pregunta"
            className="max-h-[150px] min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[16px] leading-snug outline-none placeholder:text-muted-foreground lg:text-[14.5px]"
          />
          <button
            type="button"
            onClick={() => enviar()}
            disabled={!texto.trim() || pendiente}
            aria-label="Enviar"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground active:scale-95 disabled:bg-muted disabled:text-muted-foreground"
          >
            <ArrowUp className="size-[18px]" />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-center text-[10.5px] leading-tight text-muted-foreground">
          Respuestas automáticas con los datos del catálogo: confirmá precio y stock por WhatsApp.
          {usadasHoy != null && limite != null && (
            <>
              {" "}
              Hoy: {usadasHoy} de {limite} preguntas.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Bienvenida({ pagina, onElegir }: { pagina: string | null; onElegir: (t: string) => void }) {
  const sugerencias = [
    pagina && pagina !== "Inicio" ? `¿Cómo se usa ${pagina}?` : null,
    "¿Qué aceites 20W50 tienen en stock?",
    "¿Qué filtros lleva un Toyota Hilux?",
    "¿Cuánto sale un cambio de aceite?",
    "¿En qué horario atienden?",
  ].filter((s): s is string => !!s);

  return (
    <div className="flex flex-col items-center pt-4 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-amber-600 text-primary-foreground shadow-lg">
        <Sparkles className="size-7" />
      </span>
      <p className="mt-3 text-lg font-bold">¿En qué te ayudo?</p>
      <p className="mt-1 max-w-[19rem] text-[13px] text-muted-foreground">
        Preguntame por productos, precios y stock, qué repuestos lleva tu vehículo, los servicios del
        taller o cómo hacer un pedido.
      </p>
      <div className="mt-5 flex w-full flex-col gap-2">
        {sugerencias.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onElegir(s)}
            className="rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-left text-[13.5px] transition-colors hover:border-primary/40 hover:bg-primary/10 active:scale-[0.99]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Mensaje({
  m,
  ultimo,
  onReintentar,
  onNavegar,
}: {
  m: MensajeIA;
  ultimo: boolean;
  onReintentar: () => void;
  onNavegar?: () => void;
}) {
  if (m.rol === "usuario") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-[14px] leading-snug whitespace-pre-wrap text-primary-foreground">
          {m.texto}
        </p>
      </div>
    );
  }

  if (m.error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-3.5 py-3">
        <p className="flex items-start gap-2 text-[13.5px] text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{m.texto}</span>
        </p>
        {ultimo && (
          <button
            type="button"
            onClick={onReintentar}
            className="mt-2.5 inline-flex h-9 items-center gap-1.5 rounded-xl bg-muted px-3.5 text-[13px] font-semibold active:scale-95"
          >
            <RotateCcw className="size-3.5" />
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Markdown texto={m.texto} onNavegar={onNavegar} />
      <BotonCopiar texto={m.texto} />
    </div>
  );
}

function BotonCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(texto)
          .then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
          })
          .catch(() => toast.error("No se pudo copiar"));
      }}
      className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11.5px] font-medium text-muted-foreground hover:bg-muted"
    >
      {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copiado ? "Copiado" : "Copiar"}
    </button>
  );
}

/**
 * Mientras espera. No hay avance real que mostrar (la respuesta llega
 * entera), así que el texto cambia con el tiempo: buscar en el catálogo puede
 * llevar varias consultas.
 */
function Pensando() {
  const [segundos, setSegundos] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const texto =
    segundos < 4
      ? "Pensando…"
      : segundos < 15
        ? "Buscando en el catálogo…"
        : `Sigue buscando… (${segundos} s)`;

  return (
    <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground" aria-live="polite">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-primary/70"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      {texto}
    </div>
  );
}
