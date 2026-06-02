export interface QuotationData {
  modelo: string;
  tipoServicio: 'motor' | 'caja';
  viscosidad: string;
  marca: string;
  aceites: string[];
  filtros: {
    aceite?: string;
    aire?: string;
    combustible?: string;
    caja?: string;
  };
  descuento?: number;
  precios?: number[];
  fecha?: string;
  // Items detallados para el formato "quote" (uno por aceite cotizado)
  items?: Array<{
    id: number;
    nombre: string;
    modelo: string;
    precioAceite: number;
    filtroAceite?: number;
    filtroAire?: number;
    filtroCombustible?: number;
    filtroCaja?: number;
    total: number;
    descuentoMonto: number;
    totalConDescuento: number;
    imagenUrl?: string;
  }>;
}

export type ThemeId =
  | 'dark'
  | 'light'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'teal'
  | 'indigo'
  | 'orange';
export type FormatId = 'story' | 'post' | 'reel' | 'quote';

interface Theme {
  bg: string;
  accent: string;
  text: string;
  textMuted: string;
  divider: string;
}

const THEMES: Record<ThemeId, Theme> = {
  dark: {
    bg: '#0d0d0d',
    accent: '#d97706',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    divider: 'rgba(255,255,255,0.07)',
  },
  light: {
    bg: '#fff8f0',
    accent: '#d97706',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    divider: 'rgba(0,0,0,0.07)',
  },
  green: {
    bg: '#071a14',
    accent: '#10b981',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    divider: 'rgba(255,255,255,0.07)',
  },
  blue: {
    bg: '#07101f',
    accent: '#3b82f6',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    divider: 'rgba(255,255,255,0.07)',
  },
  purple: {
    bg: '#1a0a2e',
    accent: '#a78bfa',
    text: '#f9fafb',
    textMuted: '#c4b5fd',
    divider: 'rgba(255,255,255,0.07)',
  },
  pink: {
    bg: '#2a0f2a',
    accent: '#ec4899',
    text: '#f9fafb',
    textMuted: '#f472b6',
    divider: 'rgba(255,255,255,0.07)',
  },
  red: {
    bg: '#1f0f0f',
    accent: '#ef4444',
    text: '#f9fafb',
    textMuted: '#fca5a5',
    divider: 'rgba(255,255,255,0.07)',
  },
  teal: {
    bg: '#0f2f2f',
    accent: '#14b8a6',
    text: '#f9fafb',
    textMuted: '#7ee8df',
    divider: 'rgba(255,255,255,0.07)',
  },
  indigo: {
    bg: '#0f0d2a',
    accent: '#6366f1',
    text: '#f9fafb',
    textMuted: '#a5b4fc',
    divider: 'rgba(255,255,255,0.07)',
  },
  orange: {
    bg: '#2a1810',
    accent: '#f97316',
    text: '#f9fafb',
    textMuted: '#fdba74',
    divider: 'rgba(255,255,255,0.07)',
  },
};

interface FormatDimensions {
  w: number;
  h: number;
}

const FORMATS: Record<FormatId, FormatDimensions> = {
  story: { w: 1080, h: 1920 },
  post: { w: 1080, h: 1080 },
  reel: { w: 1080, h: 1920 },
  quote: { w: 1080, h: 0 }, // alto calculado dinámicamente
};

// Layout constants para formato "quote"
const QUOTE = {
  W: 1080,
  PAD: 30,
  HEADER_H: 280,
  CARD_H: 460,
  CARD_GAP: 30,
  CARD_HEADER_H: 60,
  IMG_BOX: 280,
  FOOTER_H: 180,
  HEADER_BG: '#f97316',
  HEADER_TEXT: '#ffffff',
  HEADER_HIGHLIGHT: '#fde047',
  CARD_BORDER: '#e5e7eb',
  PAGE_BG: '#f9fafb',
  TEXT: '#111827',
  TEXT_MUTED: '#6b7280',
  DIVIDER: '#e5e7eb',
  STRIKE: '#ef4444',
  DISCOUNT: '#ef4444',
  NOW: '#2563eb',
  NOW_BG: '#dbeafe',
};

export async function buildQuotationCanvas(
  data: QuotationData,
  format: FormatId,
  theme: ThemeId
): Promise<Blob> {
  if (format === 'quote') {
    return buildQuoteCanvas(data);
  }

  const dims = FORMATS[format];
  const t = THEMES[theme];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false })!;
  canvas.width = dims.w;
  canvas.height = dims.h;
  ctx.textBaseline = 'top';

  // Fondo
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, dims.w, dims.h);

  // Gradient fondo (sutil)
  const bgGradient = ctx.createLinearGradient(0, 0, 0, dims.h);
  bgGradient.addColorStop(0, t.bg);
  bgGradient.addColorStop(1, adjustBrightness(t.bg, format === 'post' ? 0.95 : 0.98));
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, dims.w, dims.h);

  if (format === 'post') {
    drawPostFormat(ctx, canvas.width, canvas.height, data, t);
  } else if (format === 'story' || format === 'reel') {
    drawStoryFormat(ctx, canvas.width, canvas.height, data, t, format);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob fallido'))),
      'image/png'
    );
  });
}

async function buildQuoteCanvas(data: QuotationData): Promise<Blob> {
  const items = data.items ?? [];

  // Header proporcional: escala el alto del header según la cantidad de cards,
  // así con 1 solo aceite no queda una cabecera diminuta sobre una imagen corta.
  const cardsH = items.length * (QUOTE.CARD_H + QUOTE.CARD_GAP);
  const headerH = computeHeaderHeight(cardsH);

  // Calcular alto total
  const totalH = headerH + cardsH + QUOTE.FOOTER_H;

  const canvas = document.createElement('canvas');
  canvas.width = QUOTE.W;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  ctx.textBaseline = 'top';

  ctx.fillStyle = QUOTE.PAGE_BG;
  ctx.fillRect(0, 0, QUOTE.W, totalH);

  // Precargar imágenes de productos
  const productImages = await Promise.all(
    items.map((it) => (it.imagenUrl ? loadImage(it.imagenUrl) : Promise.resolve(null)))
  );

  drawQuoteHeader(ctx, data, headerH);

  let y = headerH;
  for (let i = 0; i < items.length; i++) {
    drawProductCard(ctx, y, items[i], productImages[i]);
    y += QUOTE.CARD_H + QUOTE.CARD_GAP;
  }

  drawQuoteFooter(ctx, totalH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob fallido'))),
      'image/png'
    );
  });
}

// Alto fijo del header. Se mantiene constante sin importar la cantidad de
// cards, con logo y textos grandes y proporcionados al ancho de 1080px.
function computeHeaderHeight(_cardsH: number): number {
  return QUOTE.HEADER_H;
}

function drawQuoteHeader(ctx: CanvasRenderingContext2D, data: QuotationData, h: number) {
  const w = QUOTE.W;

  // Fondo naranja del header
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#fb923c');
  grad.addColorStop(1, '#ea580c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Logo cuadro blanco a la izquierda
  const logoSize = 200;
  const logoX = 40;
  const logoY = (h - logoSize) / 2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(logoX, logoY, logoSize, logoSize);

  // Texto "LUBRICANTES Y FILTROS" dentro del logo
  ctx.fillStyle = QUOTE.HEADER_BG;
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LUBRICANTES', logoX + logoSize / 2, logoY + logoSize / 2 - 14);
  ctx.fillText('Y FILTROS', logoX + logoSize / 2, logoY + logoSize / 2 + 16);

  // Distribución vertical de los textos centrales
  ctx.textAlign = 'center';

  // Título principal
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 88px Arial, sans-serif';
  ctx.fillText('LUBRIMEC', w / 2, h * 0.13);

  // Subtítulo
  ctx.font = '30px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('COTIZACIÓN DE LUBRICANTES Y FILTROS', w / 2, h * 0.50);

  // Modelo (amarillo destacado)
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.fillStyle = QUOTE.HEADER_HIGHLIGHT;
  ctx.fillText(data.modelo, w / 2, h * 0.64);

  // Fecha
  const fecha = data.fecha || new Date().toLocaleDateString('es-PY');
  ctx.font = '24px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(fecha, w / 2, h * 0.82);
}

function drawProductCard(
  ctx: CanvasRenderingContext2D,
  yStart: number,
  item: NonNullable<QuotationData['items']>[number],
  img: HTMLImageElement | null
) {
  const w = QUOTE.W;
  const x = QUOTE.PAD;
  const cardW = w - QUOTE.PAD * 2;
  const cardH = QUOTE.CARD_H;
  const mostrarDescuento = item.descuentoMonto > 0;

  // Fondo card blanco con borde
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = QUOTE.CARD_BORDER;
  ctx.lineWidth = 1;
  roundRect(ctx, x, yStart, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();

  // Header naranja del card
  ctx.fillStyle = QUOTE.HEADER_BG;
  roundRectTop(ctx, x, yStart, cardW, QUOTE.CARD_HEADER_H, 12);
  ctx.fill();

  // Nombre producto en header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.nombre, x + 24, yStart + QUOTE.CARD_HEADER_H / 2);
  ctx.textBaseline = 'top';

  // Zona de imagen
  const imgX = x + 24;
  const imgY = yStart + QUOTE.CARD_HEADER_H + 30;
  const imgBox = QUOTE.IMG_BOX;
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(imgX, imgY, imgBox, imgBox);
  if (img) {
    drawContain(ctx, img, imgX, imgY, imgBox, imgBox);
  } else {
    ctx.fillStyle = '#d1d5db';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('[Imagen]', imgX + imgBox / 2, imgY + imgBox / 2 - 8);
  }

  // Zona de precios (derecha)
  const priceX = imgX + imgBox + 40;
  const priceMax = x + cardW - 24;
  let py = yStart + QUOTE.CARD_HEADER_H + 30;
  const rowH = 36;

  // Aceite
  drawPriceRow(ctx, 'Aceite', item.precioAceite, priceX, priceMax, py);
  py += rowH;

  // Filtros
  if (item.filtroAceite) {
    drawPriceRow(ctx, 'Filtro de Aceite', item.filtroAceite, priceX, priceMax, py);
    py += rowH;
  }
  if (item.filtroAire) {
    drawPriceRow(ctx, 'Filtro de Aire', item.filtroAire, priceX, priceMax, py);
    py += rowH;
  }
  if (item.filtroCombustible) {
    drawPriceRow(ctx, 'Filtro de Combustible', item.filtroCombustible, priceX, priceMax, py);
    py += rowH;
  }
  if (item.filtroCaja) {
    drawPriceRow(ctx, 'Filtro de Caja', item.filtroCaja, priceX, priceMax, py);
    py += rowH;
  }

  py += 16;

  // Divisor
  ctx.strokeStyle = QUOTE.DIVIDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(priceX, py);
  ctx.lineTo(priceMax, py);
  ctx.stroke();
  py += 14;

  if (mostrarDescuento) {
    // Antes (tachado)
    ctx.fillStyle = QUOTE.TEXT_MUTED;
    ctx.font = '20px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Antes:', priceX, py);
    ctx.textAlign = 'right';
    const antesStr = `Gs. ${formatGs(item.total)}`;
    ctx.fillStyle = QUOTE.STRIKE;
    ctx.fillText(antesStr, priceMax, py);
    const antesW = ctx.measureText(antesStr).width;
    ctx.strokeStyle = QUOTE.STRIKE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(priceMax - antesW, py + 11);
    ctx.lineTo(priceMax, py + 11);
    ctx.stroke();
    py += rowH;

    // Descuento (rojo)
    ctx.fillStyle = QUOTE.DISCOUNT;
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Descuento:', priceX, py);
    ctx.textAlign = 'right';
    ctx.fillText(`Gs. ${formatGs(item.descuentoMonto)}`, priceMax, py);
    py += rowH + 8;
  }

  // AHORA (banner azul)
  const ahoraH = 56;
  ctx.fillStyle = QUOTE.NOW_BG;
  ctx.fillRect(priceX, py, priceMax - priceX, ahoraH);
  ctx.fillStyle = QUOTE.NOW;
  ctx.fillRect(priceX, py, 5, ahoraH);

  ctx.fillStyle = QUOTE.NOW;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('AHORA:', priceX + 18, py + ahoraH / 2);
  ctx.textAlign = 'right';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText(`Gs. ${formatGs(item.totalConDescuento)}`, priceMax - 14, py + ahoraH / 2);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
}

function drawPriceRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  precio: number,
  x: number,
  xMax: number,
  y: number
) {
  ctx.fillStyle = QUOTE.TEXT;
  ctx.font = '20px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText(`Gs. ${formatGs(precio)}`, xMax, y);
  ctx.textAlign = 'left';
  ctx.font = '20px Arial, sans-serif';
}

function drawQuoteFooter(ctx: CanvasRenderingContext2D, totalH: number) {
  const w = QUOTE.W;
  const fy = totalH - QUOTE.FOOTER_H + 40;
  ctx.fillStyle = QUOTE.TEXT_MUTED;
  ctx.font = '20px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Presupuesto válido por 5 días a partir de la fecha de emisión.', w / 2, fy);
  ctx.fillText('Los precios y promociones no aplican los días domingos ni feriados.', w / 2, fy + 32);
  ctx.fillText('Sujeto a disponibilidad de stock.', w / 2, fy + 64);
  ctx.textAlign = 'left';
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function formatGs(n: number): string {
  return new Intl.NumberFormat('es-PY').format(Math.round(n));
}

async function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const r = Math.min(w / img.width, h / img.height);
  const dw = img.width * r;
  const dh = img.height * r;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}


function drawPostFormat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: QuotationData,
  theme: Theme
) {
  const PAD = 40;
  const INNER_W = w - PAD * 2;

  let y = PAD;

  // Header con línea de acento
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 0, 6, h);

  // Logo/título
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('LUBRIMEC', PAD, y);
  y += 70;

  // Modelo
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText('🚗 ' + data.modelo, PAD, y);
  y += 50;

  // Línea divisoria
  ctx.strokeStyle = theme.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(w - PAD, y);
  ctx.stroke();
  y += 30;

  // Viscosidad y marca
  ctx.fillStyle = theme.textMuted;
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText(`${data.viscosidad} • ${data.marca}`, PAD, y);
  y += 35;

  // Aceites
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Aceites:', PAD, y);
  y += 30;

  ctx.font = '18px Arial, sans-serif';
  for (const aceite of data.aceites) {
    ctx.fillText('✓ ' + aceite, PAD + 20, y);
    y += 28;
  }
  y += 15;

  // Filtros
  const filtrosCount = Object.values(data.filtros).filter((f) => !!f).length;
  if (filtrosCount > 0) {
    ctx.fillStyle = theme.text;
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Filtros:', PAD, y);
    y += 30;

    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = theme.textMuted;
    if (data.filtros.aceite) {
      ctx.fillText('🛢️  Aceite: ' + data.filtros.aceite, PAD + 20, y);
      y += 26;
    }
    if (data.filtros.aire) {
      ctx.fillText('💨  Aire: ' + data.filtros.aire, PAD + 20, y);
      y += 26;
    }
    if (data.filtros.combustible) {
      ctx.fillText('⛽  Combustible: ' + data.filtros.combustible, PAD + 20, y);
      y += 26;
    }
    if (data.filtros.caja) {
      ctx.fillText('⚙️  Caja: ' + data.filtros.caja, PAD + 20, y);
      y += 26;
    }
    y += 15;
  }

  // Descuento
  if (data.descuento && data.descuento > 0) {
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(`Descuento: ${data.descuento}%`, PAD, y);
    y += 45;
  }

  // Footer
  ctx.fillStyle = theme.textMuted;
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText('📍 Capitá, Ruta 2 Km 20 | +595 974 759 037', PAD, h - PAD - 20);
}

function drawStoryFormat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: QuotationData,
  theme: Theme,
  format: FormatId
) {
  const PAD = 50;
  const INNER_W = w - PAD * 2;

  // Definir zonas para story y reel
  const headerH = 120;
  let contentStartY = headerH + 40;

  // Header
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 0, 8, h);

  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 56px Arial Black, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('LUBRIMEC', PAD, 40);

  ctx.fillStyle = theme.textMuted;
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('Tu lubricentro de confianza', PAD, 85);

  // Línea divisoria
  ctx.strokeStyle = theme.divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, headerH);
  ctx.lineTo(w - PAD, headerH);
  ctx.stroke();

  let y = contentStartY;

  // Modelo (destacado)
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 42px Arial, sans-serif';
  const modelText = '🚗 ' + data.modelo;
  const modelMetrics = ctx.measureText(modelText);
  const modelX = (w - modelMetrics.width) / 2;
  ctx.textAlign = 'center';
  ctx.fillText(modelText, w / 2, y);
  y += 60;

  // Viscosidad y marca
  ctx.fillStyle = theme.textMuted;
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText(`${data.viscosidad} • ${data.marca}`, w / 2, y);
  y += 50;

  // Aceites
  ctx.textAlign = 'left';
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('Aceites seleccionados:', PAD, y);
  y += 40;

  ctx.font = '22px Arial, sans-serif';
  for (const aceite of data.aceites) {
    ctx.fillText('✓ ' + aceite, PAD + 20, y);
    y += 35;
  }
  y += 20;

  // Filtros
  const filtrosCount = Object.values(data.filtros).filter((f) => !!f).length;
  if (filtrosCount > 0) {
    ctx.fillStyle = theme.text;
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('Filtros:', PAD, y);
    y += 40;

    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = theme.textMuted;
    if (data.filtros.aceite) {
      ctx.fillText('🛢️  ' + data.filtros.aceite, PAD + 20, y);
      y += 32;
    }
    if (data.filtros.aire) {
      ctx.fillText('💨  ' + data.filtros.aire, PAD + 20, y);
      y += 32;
    }
    if (data.filtros.combustible) {
      ctx.fillText('⛽  ' + data.filtros.combustible, PAD + 20, y);
      y += 32;
    }
    if (data.filtros.caja) {
      ctx.fillText('⚙️  ' + data.filtros.caja, PAD + 20, y);
      y += 32;
    }
    y += 20;
  }

  // Descuento (badge)
  if (data.descuento && data.descuento > 0) {
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Descuento: ${data.descuento}%`, w / 2, y);
    y += 50;
  }

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.textMuted;
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('📍 Capitá, Ruta 2 Km 20 | +595 974 759 037', w / 2, h - 60);

  // Marca de agua
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('lubrimec.com.py', w / 2, h - 30);
}

// Utility: ajustar brillo de un color hex
function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.min(255, Math.floor(r * factor));
  const newG = Math.min(255, Math.floor(g * factor));
  const newB = Math.min(255, Math.floor(b * factor));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
