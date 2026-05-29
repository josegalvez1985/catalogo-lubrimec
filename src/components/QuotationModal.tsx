import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, Loader2 } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { API_BASE } from '@/lib/config';
import { type QuotationData } from '@/lib/quotationCanvas';
import logo from '@/assets/lubrimec-logo.png';

interface ApiAceite {
  id: number;
  nombre: string;
  precioBase: number;
  precioDescuento: number;
  totalLista: number;
  totalDescuento: number;
  stock: number;
  unidad: string;
  imagen?: {
    nombre: string;
    mimeType: string;
    datos?: string;
  };
}

interface ApiFiltro {
  id: number;
  idArticulo?: number;
  nombre: string;
  precio: number;
  imagen?: any;
}

interface ApiCotizacionResultado {
  aceites: ApiAceite[];
  filtros: {
    aceite?: ApiFiltro;
    aire?: ApiFiltro;
    combustible?: ApiFiltro;
    caja?: ApiFiltro;
  };
  totales: {
    sinDescuento: number;
    conDescuento: number;
    porcentajeDescuento: number;
  };
}

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QuotationData;
  cantidadLitros?: string;
  cantidadGalones?: string;
  aceitesSeleccionados?: Array<{ id: number; nombre: string; precioBruto?: number | null }>;
  apiData?: {
    resultado: ApiCotizacionResultado;
  };
}

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);
  return (
    <div className="aspect-square w-full rounded-xl border border-border bg-white overflow-hidden flex items-center justify-center">
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <span className="px-2 text-center text-xs font-medium text-muted-foreground">
          {alt}
        </span>
      )}
    </div>
  );
}

const fmt = (v: number) => `Gs. ${new Intl.NumberFormat('es-PY').format(Math.round(v))}`;

// El portapapeles no acepta JPEG; reconvertir a PNG manteniendo el render.
async function jpegBlobToPng(jpeg: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(jpeg);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

function PriceBlock({ lista, desc, size = 'sm' }: { lista?: number; desc?: number; size?: 'sm' | 'lg' }) {
  if (lista == null || lista <= 0) return null;
  const tieneDesc = desc != null && desc > 0 && desc < lista;
  const diff = tieneDesc ? lista - desc! : 0;
  const listaCls = size === 'lg' ? 'text-xs' : 'text-[10px]';
  const precioCls = size === 'lg' ? 'text-lg font-extrabold' : 'text-xs font-bold';
  const ahorroCls = size === 'lg' ? 'text-xs font-bold' : 'text-[9px] font-semibold';
  return (
    <div className="text-center leading-tight">
      {tieneDesc ? (
        <>
          <p className={`${listaCls} text-muted-foreground line-through`}>{fmt(lista)}</p>
          <p className={`${precioCls} text-foreground`}>{fmt(desc!)}</p>
          <p className={`${ahorroCls} text-emerald-600`}>Ahorrás {fmt(diff)}</p>
        </>
      ) : (
        <p className={`${precioCls} text-foreground`}>{fmt(lista)}</p>
      )}
    </div>
  );
}

export default function QuotationModal({
  isOpen,
  onClose,
  data,
  cantidadLitros,
  cantidadGalones,
  aceitesSeleccionados,
  apiData,
}: QuotationModalProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const generarJpeg = async () => {
    if (!captureRef.current) return null;
    // Respetar el tema actual: usar el fondo real del modal (claro u oscuro)
    const bg = getComputedStyle(captureRef.current).backgroundColor || '#ffffff';
    return toJpeg(captureRef.current, {
      quality: 0.95,
      pixelRatio: 2.5, // HD
      backgroundColor: bg,
      cacheBust: true,
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = await generarJpeg();
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.download = `cotizacion-lubrimec-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Error generando JPEG:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      const url = await generarJpeg();
      if (!url) return;
      const blob = await (await fetch(url)).blob();
      // El portapapeles no acepta JPEG; convertir a PNG
      const png = await jpegBlobToPng(blob);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Error copiando imagen:', e);
    } finally {
      setCopying(false);
    }
  };

  if (!isOpen) return null;

  const aceites = aceitesSeleccionados ?? apiData?.resultado.aceites ?? [];
  const filtros = apiData?.resultado.filtros ?? {};

  const pct = apiData?.resultado.totales.porcentajeDescuento ?? 0;

  // Precios por id_articulo del aceite (vienen de la cotización).
  // lista/desc = aceite solo; totalLista/totalDesc = aceite + filtros.
  const aceitePrecios = new Map<
    number,
    { lista: number; desc: number; totalLista: number; totalDesc: number }
  >(
    (apiData?.resultado.aceites ?? []).map((a) => [
      a.id,
      {
        lista: a.precioBase,
        desc: a.precioDescuento,
        totalLista: a.totalLista,
        totalDesc: a.totalDescuento,
      },
    ])
  );
  const filtrosList = [
    { key: 'aceite', tipo: 'Filtro de aceite', filtro: filtros.aceite },
    { key: 'aire', tipo: 'Filtro de aire', filtro: filtros.aire },
    { key: 'combustible', tipo: 'Filtro de combustible', filtro: filtros.combustible },
    { key: 'caja', tipo: 'Filtro de caja', filtro: filtros.caja },
  ].filter((f) => f.filtro);

  // Suma de filtros (lista y con descuento) para el total por aceite
  const filtrosListaSum = filtrosList.reduce((s, f) => s + (f.filtro!.precio || 0), 0);
  const filtrosDescSum = pct > 0 ? filtrosListaSum * (1 - pct / 100) : filtrosListaSum;

  const conDesc = (v: number) => (pct > 0 ? v * (1 - pct / 100) : v);

  const imgUrl = (id: number) =>
    `${API_BASE}/josegalvez/paginaweb/articulosimg/${id}`;

  const fechaActual = new Intl.DateTimeFormat('es-PY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-center border-b border-border bg-card/95 backdrop-blur px-6 py-4">
            <h2 className="text-xl font-bold text-foreground">Cotización</h2>
            <button
              onClick={onClose}
              className="absolute right-6 p-1.5 rounded-lg hover:bg-secondary transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={captureRef} className="p-6 space-y-6 bg-card">
            {/* Encabezado: logo a la izquierda, vehículo y fecha a la derecha */}
            <div className="flex items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Lubrimec" className="h-20 w-auto object-contain" />
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-foreground">Lubrimec</p>
                  <p className="text-xs text-muted-foreground">Lubricantes y Filtros</p>
                </div>
              </div>
              <div className="text-right">
                {data?.modelo && (
                  <p className="text-base font-bold text-foreground">{data.modelo}</p>
                )}
                <p className="text-xs text-muted-foreground">{fechaActual}</p>
              </div>
            </div>

            {/* Resumen: cantidad y descuento */}
            <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-center">
              <p className="text-sm text-foreground">
                Cantidad: <span className="font-semibold">{cantidadLitros} L</span>
                {' / '}
                <span className="font-semibold">{cantidadGalones} Gal</span>
              </p>
              {pct > 0 && (
                <p className="text-sm text-emerald-600 font-semibold">
                  Descuento otorgado: {pct}%
                </p>
              )}
            </div>

            {/* Marcas de filtros */}
            {filtrosList.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 text-center">Filtros</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {filtrosList.map(({ key, tipo, filtro }) => (
                    <div key={key} className="w-[calc(33.333%-0.5rem)] sm:w-[calc(25%-0.5625rem)] space-y-1.5">
                      <ProductImage
                        src={filtro!.idArticulo ? imgUrl(filtro!.idArticulo) : undefined}
                        alt={filtro!.nombre}
                      />
                      <p className="text-[10px] text-center font-semibold uppercase tracking-wide text-primary">
                        {tipo}
                      </p>
                      <p className="text-xs text-center text-foreground leading-tight break-words">
                        {filtro!.nombre}
                      </p>
                      <PriceBlock
                        lista={filtro!.precio}
                        desc={pct > 0 ? filtro!.precio * (1 - pct / 100) : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marcas de aceites */}
            {aceites.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 text-center">Aceites</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {aceites.map((a) => {
                    const p = aceitePrecios.get(a.id);
                    // Fallback: aceite no devuelto por la cotización → precio bruto del catálogo
                    const bruto = 'precioBruto' in a ? a.precioBruto ?? undefined : undefined;
                    const listaAceite = p?.lista ?? bruto;
                    const descAceite = p?.desc ?? (bruto != null ? conDesc(bruto) : undefined);
                    const totalLista = p?.totalLista ?? (bruto != null ? bruto + filtrosListaSum : undefined);
                    const totalDesc = p?.totalDesc ?? (bruto != null ? conDesc(bruto) + filtrosDescSum : undefined);
                    return (
                      <div key={a.id} className="w-[calc(33.333%-0.5rem)] sm:w-[calc(25%-0.5625rem)] space-y-1.5">
                        <ProductImage src={imgUrl(a.id)} alt={a.nombre} />
                        <p className="text-xs text-center text-foreground leading-tight break-words">
                          {a.nombre}
                        </p>
                        <PriceBlock lista={listaAceite} desc={descAceite} />
                        {totalLista != null && totalLista > 0 && (
                          <div className="mt-1 pt-1.5 border-t border-border">
                            <p className="text-[10px] text-center font-semibold uppercase tracking-wide text-primary">
                              Total con filtros
                            </p>
                            <PriceBlock lista={totalLista} desc={totalDesc} size="lg" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nota legal */}
            <div className="border-t border-border pt-4 text-center space-y-0.5">
              <p className="text-[11px] font-medium text-foreground">
                Presupuesto válido por 5 días a partir de la fecha de emisión.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Los precios y promociones no aplican los días domingos ni feriados.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Sujeto a disponibilidad de stock.
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="sticky bottom-0 flex gap-3 border-t border-border bg-card/95 backdrop-blur px-6 py-4">
            <button
              onClick={handleDownload}
              disabled={downloading || copying}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Descargar
            </button>
            <button
              onClick={handleCopy}
              disabled={downloading || copying}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-secondary transition disabled:opacity-50"
            >
              {copying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : copied ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
