import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

/**
 * Markdown chico para las respuestas del asistente.
 *
 * Propio y no `react-markdown`: la IA usa un subconjunto conocido (títulos,
 * listas, tablas, negrita, código, enlaces) y así no se suma una dependencia.
 * **Nunca arma HTML a partir del texto**: todo sale como nodos de React, así
 * que una respuesta no puede inyectar nada en la página.
 *
 * - Bloques: `#`/`##`/`###`, listas con `-`, `*` o `1.` (la sangría es un
 *   nivel más), tablas con `|` y su fila `---`, código con tres comillas
 *   invertidas, citas con `>` y `---` como separador.
 * - En línea: `**negrita**`, `*cursiva*` / `_cursiva_`, `` `código` `` y
 *   enlaces: `[texto](https://...)` en pestaña nueva, y `[texto](/catalogo?q=...)`
 *   dentro del sitio (`onNavegar` avisa, para cerrar la hoja del celular).
 */
export function Markdown({
  texto,
  className,
  onNavegar,
}: {
  texto: string;
  className?: string;
  onNavegar?: () => void;
}) {
  return (
    <div className={cn("space-y-2.5 text-[14px] leading-relaxed break-words", className)}>
      {bloques(texto.replace(/\r\n?/g, "\n"), onNavegar)}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bloques                                                                     */
/* -------------------------------------------------------------------------- */

const RE_LISTA = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const RE_TITULO = /^(#{1,6})\s+(.*)$/;
const RE_SEPARADOR_TABLA = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const RE_SEPARADOR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const esFilaTabla = (l: string) => l.trim().startsWith("|") || /\S\s*\|\s*\S/.test(l);
/** La fila de guiones de una tabla: con al menos un `|`, para no confundirla con `---`. */
const esSeparadorTabla = (l = "") => l.includes("|") && RE_SEPARADOR_TABLA.test(l);
const empiezaTabla = (lineas: string[], i: number) =>
  esFilaTabla(lineas[i]) && esSeparadorTabla(lineas[i + 1]);

function bloques(md: string, onNavegar?: () => void): ReactNode[] {
  const lineas = md.split("\n");
  const out: ReactNode[] = [];
  const linea_ = (t: string) => enLinea(t, onNavegar);
  let i = 0;
  let k = 0;

  while (i < lineas.length) {
    const linea = lineas[i];

    if (!linea.trim()) {
      i++;
      continue;
    }

    // Código
    if (linea.trim().startsWith("```")) {
      const codigo: string[] = [];
      i++;
      while (i < lineas.length && !lineas[i].trim().startsWith("```")) codigo.push(lineas[i++]);
      i++; // la que cierra
      out.push(
        <pre
          key={k++}
          className="overflow-x-auto rounded-xl bg-muted px-3 py-2.5 font-mono text-[12px] leading-snug"
        >
          {codigo.join("\n")}
        </pre>,
      );
      continue;
    }

    // Título
    const titulo = RE_TITULO.exec(linea);
    if (titulo) {
      const nivel = titulo[1].length;
      out.push(
        <p key={k++} className={cn("font-bold", nivel <= 2 ? "pt-1 text-[16px]" : "text-[14.5px]")}>
          {linea_(titulo[2])}
        </p>,
      );
      i++;
      continue;
    }

    // Separador
    if (RE_SEPARADOR.test(linea)) {
      out.push(<hr key={k++} className="border-border/70" />);
      i++;
      continue;
    }

    // Tabla: una fila con | seguida de la fila de guiones.
    if (empiezaTabla(lineas, i)) {
      const encabezado = celdas(linea);
      const alineacion = celdas(lineas[i + 1]).map((c) =>
        c.endsWith(":") ? (c.startsWith(":") ? "center" : "right") : "left",
      ) as ("left" | "center" | "right")[];
      const filas: string[][] = [];
      i += 2;
      while (i < lineas.length && lineas[i].trim() && esFilaTabla(lineas[i])) {
        filas.push(celdas(lineas[i++]));
      }
      out.push(
        <Tabla key={k++} encabezado={encabezado} alineacion={alineacion} filas={filas} enLinea={linea_} />,
      );
      continue;
    }

    // Lista: los ítems seguidos (y sus líneas de continuación, con sangría).
    if (RE_LISTA.test(linea)) {
      const items: { nivel: number; ordenada: boolean; marca: string; texto: string }[] = [];
      while (i < lineas.length) {
        const m = RE_LISTA.exec(lineas[i]);
        if (m) {
          items.push({
            nivel: Math.min(3, Math.floor(m[1].replace(/\t/g, "  ").length / 2)),
            ordenada: /\d/.test(m[2]),
            marca: m[2],
            texto: m[3],
          });
          i++;
        } else if (lineas[i].trim() && /^\s+/.test(lineas[i]) && items.length) {
          items[items.length - 1].texto += " " + lineas[i].trim();
          i++;
        } else break;
      }
      out.push(
        <ul key={k++} className="space-y-1">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2" style={{ paddingLeft: `${it.nivel * 1.1}rem` }}>
              <span
                aria-hidden
                className={cn(
                  "shrink-0 text-muted-foreground tabular-nums",
                  it.ordenada ? "min-w-[1.1rem] text-right" : "pt-[0.55em]",
                )}
              >
                {it.ordenada ? (
                  it.marca.replace(")", ".")
                ) : (
                  <span className="block size-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className="min-w-0 flex-1">{linea_(it.texto)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Cita
    if (linea.trimStart().startsWith(">")) {
      const cita: string[] = [];
      while (i < lineas.length && lineas[i].trimStart().startsWith(">")) {
        cita.push(lineas[i++].trimStart().replace(/^>\s?/, ""));
      }
      out.push(
        <div key={k++} className="border-l-2 border-primary/40 pl-3 text-muted-foreground">
          {bloques(cita.join("\n"), onNavegar)}
        </div>,
      );
      continue;
    }

    // Párrafo: hasta una línea vacía o el comienzo de otro bloque. Cada salto
    // de línea se respeta (la IA los usa como tales).
    const parrafo: string[] = [];
    while (
      i < lineas.length &&
      lineas[i].trim() &&
      !RE_TITULO.test(lineas[i]) &&
      !RE_SEPARADOR.test(lineas[i]) &&
      !RE_LISTA.test(lineas[i]) &&
      !lineas[i].trim().startsWith("```") &&
      !lineas[i].trimStart().startsWith(">") &&
      !empiezaTabla(lineas, i)
    ) {
      parrafo.push(lineas[i++].trim());
    }
    // Nunca quedarse en la misma línea: si ningún bloque la tomó, va sola.
    if (!parrafo.length) parrafo.push(lineas[i++].trim());
    out.push(
      <p key={k++}>
        {parrafo.map((l, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {linea_(l)}
          </Fragment>
        ))}
      </p>,
    );
  }
  return out;
}

function celdas(linea: string) {
  return linea
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"));
}

function Tabla({
  encabezado,
  alineacion,
  filas,
  enLinea,
}: {
  encabezado: string[];
  alineacion: ("left" | "center" | "right")[];
  filas: string[][];
  enLinea: (t: string) => ReactNode[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <table className="w-full border-collapse text-[12.5px]">
        <thead className="bg-muted/70">
          <tr>
            {encabezado.map((c, j) => (
              <th
                key={j}
                style={{ textAlign: alineacion[j] ?? "left" }}
                className="px-2.5 py-1.5 font-semibold whitespace-nowrap"
              >
                {enLinea(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-t border-border/60 even:bg-muted/30">
              {encabezado.map((_, j) => (
                <td
                  key={j}
                  style={{ textAlign: alineacion[j] ?? "left" }}
                  className="px-2.5 py-1.5 align-top tabular-nums"
                >
                  {enLinea(f[j] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* En línea                                                                    */
/* -------------------------------------------------------------------------- */

// Enlaces: http(s) o una ruta del sitio que empieza con "/" (no "//", que
// sería otro dominio).
const RE_EN_LINEA =
  /(`[^`]+`)|(\*\*(?=\S)[\s\S]*?\S\*\*)|(__(?=\S)[\s\S]*?\S__)|(\[[^\]]+\]\((?:https?:\/\/|\/(?!\/))[^)\s]*\))|(\*(?=\S)[^*]*?\S\*)|((?<![\p{L}\p{N}])_(?=\S)[^_]*?\S_(?![\p{L}\p{N}]))/gu;

const claseEnlace = "font-medium text-primary underline underline-offset-2";

function enLinea(texto: string, onNavegar?: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  let ultimo = 0;
  let k = 0;
  for (const m of texto.matchAll(RE_EN_LINEA)) {
    const desde = m.index ?? 0;
    if (desde > ultimo) out.push(texto.slice(ultimo, desde));
    const t = m[0];
    if (m[1]) {
      out.push(
        <code key={k++} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.88em]">
          {t.slice(1, -1)}
        </code>,
      );
    } else if (m[2] || m[3]) {
      out.push(
        <strong key={k++} className="font-semibold">
          {enLinea(t.slice(2, -2), onNavegar)}
        </strong>,
      );
    } else if (m[4]) {
      const enlace = /^\[([^\]]+)\]\((.+)\)$/.exec(t);
      const destino = enlace?.[2] ?? "";
      const etiqueta = enLinea(enlace?.[1] ?? t, onNavegar);
      out.push(
        destino.startsWith("/") ? (
          <Link key={k++} to={destino} onClick={onNavegar} className={claseEnlace}>
            {etiqueta}
          </Link>
        ) : (
          <a key={k++} href={destino} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
            {etiqueta}
          </a>
        ),
      );
    } else {
      out.push(<em key={k++}>{enLinea(t.slice(1, -1), onNavegar)}</em>);
    }
    ultimo = desde + t.length;
  }
  if (ultimo < texto.length) out.push(texto.slice(ultimo));
  return out;
}
