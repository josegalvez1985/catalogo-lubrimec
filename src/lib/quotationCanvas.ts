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
export type FormatId = 'story' | 'post' | 'reel';

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
};

export async function buildQuotationCanvas(
  data: QuotationData,
  format: FormatId,
  theme: ThemeId
): Promise<Blob> {
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

  // Dibujar contenido según formato
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
