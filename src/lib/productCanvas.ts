export interface CanvasProductData {
  descripcion_articulo: string;
  descripcion_marca?: string | null;
  precio?: number | null;
  stock?: number | null;
}

/** Genera un canvas PNG con diseño de producto Lubrimec y lo devuelve como Blob. */
export async function buildProductCanvas(
  imgSrc: string,
  articulo: CanvasProductData
): Promise<Blob> {
  // ── 1. Cargar imagen ──────────────────────────────────────────────────────
  const imgRes = await fetch(imgSrc);
  if (!imgRes.ok) throw new Error("Error descargando imagen");
  const imgBlob = await imgRes.blob();

  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(imgBlob);
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });

  // ── 2. Constantes de layout ────────────────────────────────────────────────
  const W = 900;
  const PAD = 48;
  const INNER_W = W - PAD * 2;

  const HEADER_H = 88;
  const IMG_SIZE = 680;       // imagen cuadrada centrada
  const IMG_MARGIN_TOP = 28;
  const IMG_MARGIN_BOT = 36;

  const DESC_FONT_SIZE = 40;
  const DESC_LINE_H = 54;
  const MARCA_FONT_SIZE = 30;
  const MARCA_H = articulo.descripcion_marca ? 46 : 0;
  const PRICE_H = articulo.precio != null ? 86 : 0;
  const STOCK_H = 70;
  const GAP = 20;
  const FOOTER_H = 68;

  // ── 3. Pre-medir líneas de descripción ────────────────────────────────────
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.font = `bold ${DESC_FONT_SIZE}px Arial, sans-serif`;

  const descLines: string[] = [];
  let currentLine = "";
  for (const word of articulo.descripcion_articulo.split(" ")) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (tempCtx.measureText(test).width > INNER_W && currentLine) {
      descLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) descLines.push(currentLine);

  const DESC_H = descLines.length * DESC_LINE_H;

  // ── 4. Altura total dinámica ───────────────────────────────────────────────
  const TOTAL_H =
    HEADER_H +
    IMG_MARGIN_TOP +
    IMG_SIZE +
    IMG_MARGIN_BOT +
    DESC_H + GAP +
    (MARCA_H > 0 ? MARCA_H + GAP : 0) +
    GAP + // separador
    (PRICE_H > 0 ? PRICE_H + GAP : 0) +
    STOCK_H + GAP +
    FOOTER_H;

  // ── 5. Crear canvas ────────────────────────────────────────────────────────
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false })!;
  canvas.width = W;
  canvas.height = TOTAL_H;
  ctx.textBaseline = "top";

  // ── 6. Fondo con degradado ─────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, TOTAL_H);
  bg.addColorStop(0, "#18120a");
  bg.addColorStop(0.5, "#111111");
  bg.addColorStop(1, "#0d0d0d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, TOTAL_H);

  // ── 7. Header ──────────────────────────────────────────────────────────────
  // Barra de acento izquierda
  ctx.fillStyle = "#d97706";
  ctx.fillRect(0, 0, 7, HEADER_H);

  // Fondo sutil del header
  ctx.fillStyle = "rgba(217,119,6,0.07)";
  ctx.fillRect(7, 0, W - 7, HEADER_H);

  // Línea inferior del header
  ctx.fillStyle = "rgba(217,119,6,0.25)";
  ctx.fillRect(0, HEADER_H - 1, W, 1);

  // Título "LUBRIMEC"
  ctx.fillStyle = "#d97706";
  ctx.font = `bold 50px Arial Black, Arial, sans-serif`;
  ctx.textAlign = "left";
  const titleY = (HEADER_H - 50) / 2;
  ctx.fillText("LUBRIMEC", PAD, titleY);

  // Subtítulo
  ctx.fillStyle = "#6b7280";
  ctx.font = `20px Arial, sans-serif`;
  const lubW = tempCtx.measureText("LUBRIMEC").width;
  // medir con la fuente correcta
  ctx.font = `bold 50px Arial Black, Arial, sans-serif`;
  const lubrimecW = ctx.measureText("LUBRIMEC").width;
  ctx.font = `20px Arial, sans-serif`;
  ctx.fillText("Tu lubricentro de confianza", PAD + lubrimecW + 20, titleY + 50 - 20 - 2);

  // ── 8. Área de imagen ─────────────────────────────────────────────────────
  const imgX = (W - IMG_SIZE) / 2;
  const imgY = HEADER_H + IMG_MARGIN_TOP;

  // Sombra suave
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(imgX - 4, imgY - 4, IMG_SIZE + 8, IMG_SIZE + 8);

  // Fondo blanco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(imgX, imgY, IMG_SIZE, IMG_SIZE);

  // Imagen centrada
  const scale = Math.min(IMG_SIZE / img.naturalWidth, IMG_SIZE / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(
    img,
    imgX + (IMG_SIZE - sw) / 2,
    imgY + (IMG_SIZE - sh) / 2,
    sw,
    sh
  );

  // ── 9. Sección de texto ───────────────────────────────────────────────────
  let y = imgY + IMG_SIZE + IMG_MARGIN_BOT;
  ctx.textAlign = "left";

  // Descripción
  ctx.fillStyle = "#f9fafb";
  ctx.font = `bold ${DESC_FONT_SIZE}px Arial, sans-serif`;
  for (const lineText of descLines) {
    ctx.fillText(lineText, PAD, y);
    y += DESC_LINE_H;
  }
  y += GAP;

  // Marca
  if (articulo.descripcion_marca) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = `${MARCA_FONT_SIZE}px Arial, sans-serif`;
    ctx.fillText(articulo.descripcion_marca.toUpperCase(), PAD, y);
    y += MARCA_H + GAP;
  }

  // Línea divisoria
  y += GAP;
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += GAP;

  // Precio
  if (articulo.precio != null) {
    ctx.fillStyle = "#d97706";
    ctx.font = `bold 66px Arial Black, Arial, sans-serif`;
    ctx.fillText(`Gs. ${new Intl.NumberFormat("es-PY").format(articulo.precio)}`, PAD, y);
    y += PRICE_H + GAP;
  }

  // Badge de stock con forma pill
  const isStock = (articulo.stock ?? 0) > 0;
  const stockText = isStock
    ? `✔  ${articulo.stock} en stock`
    : "✕  Sin stock";
  const stockFg = isStock ? "#10b981" : "#ef4444";
  const stockBgColor = isStock ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)";

  ctx.font = `bold 32px Arial, sans-serif`;
  const stockTextW = ctx.measureText(stockText).width;
  const bPX = 26;
  const bPY = 16;
  const bH = 32 + bPY * 2;
  const bW = stockTextW + bPX * 2;
  const bX = PAD;
  const bY = y;
  const bR = bH / 2;

  // Pill background
  ctx.fillStyle = stockBgColor;
  ctx.beginPath();
  ctx.moveTo(bX + bR, bY);
  ctx.lineTo(bX + bW - bR, bY);
  ctx.arc(bX + bW - bR, bY + bR, bR, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(bX + bR, bY + bH);
  ctx.arc(bX + bR, bY + bR, bR, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
  ctx.fill();

  // Pill border
  ctx.strokeStyle = stockFg;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pill text
  ctx.fillStyle = stockFg;
  ctx.textBaseline = "middle";
  ctx.fillText(stockText, bX + bPX, bY + bH / 2);
  y += STOCK_H + GAP;

  // ── 10. Footer ────────────────────────────────────────────────────────────
  // Línea superior del footer
  ctx.fillStyle = "#d97706";
  ctx.fillRect(0, y, W, 2);

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, y + 2, W, FOOTER_H - 2);

  ctx.fillStyle = "#6b7280";
  ctx.font = "22px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "📍  Capitá, Ruta 2 Km 20  ·  +595 974 759 037",
    W / 2,
    y + 2 + (FOOTER_H - 2) / 2
  );

  // ── 11. Exportar ──────────────────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob fallido"))),
      "image/png"
    );
  });
}
