import { loadCachedImage } from "./imageCache";
import type { RankBadge } from "./salesRanking";

export interface CanvasProductData {
  descripcion_articulo: string;
  descripcion_marca?: string | null;
  precio?: number | null;
  precioLista?: number | null;
  stock?: number | null;
}

// Tipos de producto conocidos (en orden de longitud desc para matchear primero los más largos)
const TIPOS_CONOCIDOS = [
  "FILTRO DE ACEITE",
  "FILTRO DE AIRE",
  "FILTRO DE COMBUSTIBLE",
  "FILTRO DE CAJA",
  "FILTRO DE TRANSMISION",
  "ACEITE DE MOTOR",
  "ACEITE DE CAJA",
  "ACEITE DE TRANSMISION",
  "ACEITE HIDRAULICO",
  "ACEITE DIFERENCIAL",
  "GRASA",
  "FILTRO",
  "ACEITE",
];

interface ProductoParsed {
  tipo: string;         // "Filtro de aceite"
  codigo: string;       // "04152-B1010"
  vehiculos: string[];  // ["Toyota New Vitz", "Toyota Allion 2011"]
  marcaInterna: string; // "Seineca" (extraída del nombre, no del campo marca)
}

// Patrón de código alfanumérico: contiene guión y mezcla letras+dígitos, ej: 04152-B1010, 48654-0d060
const CODIGO_REGEX = /^[A-Z0-9]{2,}[-][A-Z0-9]{2,}([-][A-Z0-9]+)*$/i;

function esCodigoAlfanumerico(s: string): boolean {
  return CODIGO_REGEX.test(s.trim());
}

/**
 * Parsea descripcion_articulo en partes legibles.
 * Ej: "FILTRO DE ACEITE 04152-B1010 NEW VITZ, ALLION 2011, BOXI SEINECA"
 */
function parsearDescripcion(desc: string, marca?: string | null): ProductoParsed {
  const upper = desc.toUpperCase().trim();
  const marcaUpper = (marca ?? "").toUpperCase().trim();

  // 1. Extraer tipo
  let tipo = "";
  let resto = desc.trim();
  for (const t of TIPOS_CONOCIDOS) {
    if (upper.startsWith(t)) {
      tipo = t.charAt(0) + t.slice(1).toLowerCase();
      resto = desc.slice(t.length).trim();
      break;
    }
  }
  if (!tipo) {
    const palabras = desc.split(" ");
    tipo = palabras.slice(0, 2).join(" ");
    resto = palabras.slice(2).join(" ").trim();
  }

  // 2. Extraer primer código al inicio del resto
  const codigoRegex = /^([A-Z0-9][-A-Z0-9.]{3,}[A-Z0-9])\s*/i;
  let codigo = "";
  const codigoMatch = resto.match(codigoRegex);
  if (codigoMatch) {
    codigo = codigoMatch[1];
    resto = resto.slice(codigoMatch[0].length).trim();
  }

  // 3. Separar por comas y filtrar tokens que son códigos o la marca del artículo
  const vehiculos = resto
    .split(",")
    .map((v) => v.trim())
    .filter((v) => {
      if (!v) return false;
      if (esCodigoAlfanumerico(v)) return false;              // es un código, no un vehículo
      if (marcaUpper && v.toUpperCase() === marcaUpper) return false; // es la marca
      return true;
    })
    .map((v) => toTitleCase(v));

  return { tipo, codigo, vehiculos, marcaInterna: "" };
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Genera un canvas PNG con diseño de producto Lubrimec y lo devuelve como Blob. */
export async function buildProductCanvas(
  imgSrc: string,
  articulo: CanvasProductData,
  rankBadge?: RankBadge
): Promise<Blob> {
  const img = await loadCachedImage(imgSrc);
  if (!img) throw new Error("No se pudo cargar la imagen del producto");

  const parsed = parsearDescripcion(articulo.descripcion_articulo, articulo.descripcion_marca);

  const W = 900;
  const PAD = 48;
  const INNER_W = W - PAD * 2;
  const ACCENT = "#D88700";

  const HEADER_H = 88;
  const IMG_SIZE = 620;
  const IMG_MARGIN_TOP = 24;
  const IMG_MARGIN_BOT = 28;
  const GAP = 16;
  const FOOTER_H = 68;
  const WA_H = 80; // banda de WhatsApp

  const tieneDescuento =
    articulo.precio != null &&
    articulo.precioLista != null &&
    articulo.precioLista > articulo.precio;
  const ahorro = tieneDescuento ? articulo.precioLista! - articulo.precio! : 0;
  const pctDesc = tieneDescuento
    ? Math.round((ahorro / articulo.precioLista!) * 100)
    : 0;

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const palette = isDark
    ? { bg: "#0d0d0d", desc: "#f9fafb", muted: "#9ca3af", divider: "rgba(255,255,255,0.08)", imgShadow: "#2a2a2a", footerBg: "rgba(255,255,255,0.04)", footerText: "#6b7280" }
    : { bg: "#f8fafc", desc: "#0f172a", muted: "#64748b", divider: "rgba(0,0,0,0.08)", imgShadow: "#e2e8f0", footerBg: "rgba(0,0,0,0.03)", footerText: "#64748b" };

  // ── Medir alturas dinámicas ───────────────────────────────────────────────
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d")!;
  // Descripción completa (word-wrap), quitando la marca del final si ya viene en descripcion_marca
  const DESC_FS = 32;
  const DESC_LINE_H = 44;
  const descTexto = (() => {
    let d = articulo.descripcion_articulo.trim();
    if (articulo.descripcion_marca) {
      const marcaUp = articulo.descripcion_marca.toUpperCase();
      // Quitar la marca si aparece al final (con o sin espacios)
      const trailing = new RegExp(`\\s*\\b${marcaUp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b\\s*$`, "i");
      d = d.replace(trailing, "").trim();
    }
    return d;
  })();
  tempCtx.font = `bold ${DESC_FS}px Arial, sans-serif`;
  const descWords = descTexto.split(" ");
  const descLines: string[] = [];
  let descCurrent = "";
  for (const word of descWords) {
    const test = descCurrent ? `${descCurrent} ${word}` : word;
    if (tempCtx.measureText(test).width > INNER_W && descCurrent) {
      descLines.push(descCurrent);
      descCurrent = word;
    } else {
      descCurrent = test;
    }
  }
  if (descCurrent) descLines.push(descCurrent);
  const DESC_H = descLines.length * DESC_LINE_H;

  // Marca
  const MARCA_H = articulo.descripcion_marca ? 40 : 0;

  // Precio
  const LISTA_H = tieneDescuento ? 38 : 0;
  const BADGE_DESC_H = tieneDescuento ? 52 : 0;
  const PRECIO_H = articulo.precio != null ? 80 : 0;
  const AHORRO_H = tieneDescuento ? 38 : 0;

  // Stock + WhatsApp
  const STOCK_H = 64;

  const textBlockH =
    DESC_H + GAP +
    (MARCA_H > 0 ? MARCA_H + GAP : 0) +
    GAP + // divisor
    (LISTA_H > 0 ? LISTA_H + GAP : 0) +
    (BADGE_DESC_H > 0 ? BADGE_DESC_H + GAP : 0) +
    (PRECIO_H > 0 ? PRECIO_H + GAP : 0) +
    (AHORRO_H > 0 ? AHORRO_H + GAP : 0) +
    STOCK_H + GAP +
    WA_H + GAP;

  const TOTAL_H = HEADER_H + IMG_MARGIN_TOP + IMG_SIZE + IMG_MARGIN_BOT + textBlockH + FOOTER_H;

  // ── Canvas ────────────────────────────────────────────────────────────────
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false })!;
  canvas.width = W;
  canvas.height = TOTAL_H;
  ctx.textBaseline = "top";

  // Fondo
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, TOTAL_H);

  // ── Header ────────────────────────────────────────────────────────────────
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, 7, HEADER_H);
  ctx.fillStyle = `${ACCENT}12`;
  ctx.fillRect(7, 0, W - 7, HEADER_H);
  ctx.fillStyle = `${ACCENT}40`;
  ctx.fillRect(0, HEADER_H - 1, W, 1);

  ctx.fillStyle = ACCENT;
  ctx.font = "bold 50px Arial Black, Arial, sans-serif";
  ctx.textAlign = "left";
  const lubrimecW = ctx.measureText("LUBRIMEC").width;
  ctx.fillText("LUBRIMEC", PAD, (HEADER_H - 50) / 2);
  ctx.fillStyle = palette.muted;
  ctx.font = "20px Arial, sans-serif";
  ctx.fillText("Tu lubricentro de confianza", PAD + lubrimecW + 20, (HEADER_H - 50) / 2 + 30);

  // ── Imagen ────────────────────────────────────────────────────────────────
  const imgX = (W - IMG_SIZE) / 2;
  const imgY = HEADER_H + IMG_MARGIN_TOP;
  ctx.fillStyle = palette.imgShadow;
  ctx.fillRect(imgX - 4, imgY - 4, IMG_SIZE + 8, IMG_SIZE + 8);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(imgX, imgY, IMG_SIZE, IMG_SIZE);
  const scale = Math.min(IMG_SIZE / img.naturalWidth, IMG_SIZE / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, imgX + (IMG_SIZE - sw) / 2, imgY + (IMG_SIZE - sh) / 2, sw, sh);

  // ── Badge de ranking (sobre imagen, esquina superior izquierda) ──────────
  if (rankBadge) {
    const badgeText = `${rankBadge.emoji}  ${rankBadge.label}`;
    ctx.font = "bold 22px Arial, sans-serif";
    const btW = ctx.measureText(badgeText).width;
    const bpx = 16; const bh = 40; const bw = btW + bpx * 2; const br = bh / 2;
    const bx = imgX + 12; const by = imgY + 12;
    ctx.fillStyle = rankBadge.canvasBg;
    ctx.strokeStyle = rankBadge.canvasColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + br, by); ctx.lineTo(bx + bw - br, by);
    ctx.arc(bx + bw - br, by + br, br, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(bx + br, by + bh);
    ctx.arc(bx + br, by + br, br, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = rankBadge.canvasColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(badgeText, bx + bpx, by + bh / 2);
    ctx.textBaseline = "top";
  }

  // ── Texto ────────────────────────────────────────────────────────────────
  let y = imgY + IMG_SIZE + IMG_MARGIN_BOT;
  ctx.textAlign = "left";
  const nf = new Intl.NumberFormat("es-PY");

  // Descripción completa
  ctx.fillStyle = palette.desc;
  ctx.font = `bold ${DESC_FS}px Arial, sans-serif`;
  for (const line of descLines) {
    ctx.fillText(line, PAD, y);
    y += DESC_LINE_H;
  }
  y += GAP;

  // Marca
  if (articulo.descripcion_marca) {
    ctx.fillStyle = palette.muted;
    ctx.font = "26px Arial, sans-serif";
    ctx.fillText("Marca:", PAD, y);
    const marcaLabelW = ctx.measureText("Marca: ").width;
    ctx.fillStyle = palette.desc;
    ctx.font = "bold 26px Arial, sans-serif";
    ctx.fillText(articulo.descripcion_marca, PAD + marcaLabelW, y);
    y += MARCA_H + GAP;
  }

  // Divisor
  y += GAP / 2;
  ctx.strokeStyle = palette.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += GAP;

  if (tieneDescuento) {
    // 1. Badge "🏷️ X% OFF"
    const badgeText = `🏷️  ${pctDesc}% OFF`;
    ctx.font = "bold 26px Arial, sans-serif";
    const badgeTW = ctx.measureText(badgeText).width;
    const bPX = 20; const bH2 = 46; const bW2 = badgeTW + bPX * 2; const bR2 = bH2 / 2;
    ctx.fillStyle = "#fef3c7";
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD + bR2, y); ctx.lineTo(PAD + bW2 - bR2, y);
    ctx.arc(PAD + bW2 - bR2, y + bR2, bR2, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(PAD + bR2, y + bH2);
    ctx.arc(PAD + bR2, y + bR2, bR2, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#92400e";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, PAD + bPX, y + bH2 / 2);
    ctx.textBaseline = "top";
    y += BADGE_DESC_H + GAP;

    // 2. "Precio anterior Gs. X"
    ctx.fillStyle = palette.muted;
    ctx.font = "28px Arial, sans-serif";
    const anteriorStr = `Precio anterior  Gs. ${nf.format(articulo.precioLista!)}`;
    ctx.fillText(anteriorStr, PAD, y);
    const anteriorW = ctx.measureText(anteriorStr).width;
    ctx.strokeStyle = palette.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, y + 15);
    ctx.lineTo(PAD + anteriorW, y + 15);
    ctx.stroke();
    y += LISTA_H + GAP;
  }

  // Precio actual
  if (articulo.precio != null) {
    ctx.fillStyle = ACCENT;
    ctx.font = "bold 66px Arial Black, Arial, sans-serif";
    ctx.fillText(`Gs. ${nf.format(articulo.precio)}`, PAD, y);
    y += PRECIO_H + GAP;

    if (tieneDescuento) {
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 30px Arial, sans-serif";
      ctx.fillText(`Ahorrás Gs. ${nf.format(ahorro)}`, PAD, y);
      y += AHORRO_H + GAP;
    }
  }

  // Stock — estilo comercial
  const isStock = (articulo.stock ?? 0) > 0;
  const stockLine1 = isStock ? "✔  Entrega inmediata" : "✕  Sin stock";
  const stockLine2 = isStock ? `${articulo.stock} unidades disponibles` : "";
  const stockFg = isStock ? "#10b981" : "#ef4444";
  const stockBg = isStock ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)";

  ctx.font = "bold 28px Arial, sans-serif";
  const sl1W = ctx.measureText(stockLine1).width;
  const pillH = 60; const pillPX = 24; const pillR = pillH / 2;
  const pillW = Math.max(sl1W + pillPX * 2, 300);
  ctx.fillStyle = stockBg;
  ctx.strokeStyle = stockFg;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD + pillR, y); ctx.lineTo(PAD + pillW - pillR, y);
  ctx.arc(PAD + pillW - pillR, y + pillR, pillR, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(PAD + pillR, y + pillH);
  ctx.arc(PAD + pillR, y + pillR, pillR, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = stockFg;
  ctx.textBaseline = "middle";
  if (stockLine2) {
    ctx.fillText(stockLine1, PAD + pillPX, y + pillH / 2 - 14);
    ctx.font = "22px Arial, sans-serif";
    ctx.fillText(stockLine2, PAD + pillPX, y + pillH / 2 + 14);
  } else {
    ctx.fillText(stockLine1, PAD + pillPX, y + pillH / 2);
  }
  ctx.textBaseline = "top";
  y += STOCK_H + GAP;

  // Banda de WhatsApp
  ctx.fillStyle = "#16a34a";
  ctx.fillRect(0, y, W, WA_H);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("💬  Pedilo por WhatsApp  ·  0974 759 037", W / 2, y + WA_H / 2);
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  y += WA_H + GAP;

  // ── Footer ────────────────────────────────────────────────────────────────
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, y, W, 2);
  ctx.fillStyle = palette.footerBg;
  ctx.fillRect(0, y + 2, W, FOOTER_H - 2);
  ctx.fillStyle = palette.footerText;
  ctx.font = "22px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("📍  Capitá, Ruta 2 Km 20  ·  www.lubrimec.shop", W / 2, y + 2 + (FOOTER_H - 2) / 2);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob fallido"))),
      "image/png"
    );
  });
}
