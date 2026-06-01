import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, Loader2 } from 'lucide-react';
import { toBlob } from 'html-to-image';
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
  /** @deprecated ya no se muestran en la cotización; se mantienen para compatibilidad del llamador */
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

function PriceBlock({
  lista,
  desc,
  size = 'sm',
  align = 'center',
}: {
  lista?: number;
  desc?: number;
  // *Big = variantes ampliadas para la imagen generada (más legibles en celular).
  size?: 'sm' | 'lg' | 'smBig' | 'lgBig';
  align?: 'left' | 'center' | 'right';
}) {
  if (lista == null || lista <= 0) return null;
  const tieneDesc = desc != null && desc > 0 && desc < lista;
  const diff = tieneDesc ? lista - desc! : 0;
  const listaCls =
    size === 'lgBig' ? 'text-lg' : size === 'smBig' ? 'text-base' : size === 'lg' ? 'text-xs' : 'text-[10px]';
  const precioCls =
    size === 'lgBig'
      ? 'text-3xl font-extrabold'
      : size === 'smBig'
        ? 'text-xl font-bold'
        : size === 'lg'
          ? 'text-lg font-extrabold'
          : 'text-xs font-bold';
  const ahorroCls =
    size === 'lgBig'
      ? 'text-base font-bold'
      : size === 'smBig'
        ? 'text-sm font-semibold'
        : size === 'lg'
          ? 'text-xs font-bold'
          : 'text-[9px] font-semibold';
  const alignCls = align === 'right' ? 'text-right' : align === 'left' ? 'text-left' : 'text-center';
  return (
    <div className={`${alignCls} leading-tight`}>
      {tieneDesc ? (
        <>
          <p className={`${listaCls} text-muted-foreground line-through`}>{fmt(lista)}</p>
          <p className={`${precioCls} text-foreground`}>{fmt(desc!)}</p>
          <p className={`${ahorroCls} text-emerald-600 dark:text-emerald-400`}>Ahorrás {fmt(diff)}</p>
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
  aceitesSeleccionados,
  apiData,
}: QuotationModalProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  // Mientras capturamos, forzamos el layout de 3 columnas (imagen | precio | total)
  // sin importar el ancho de pantalla. Las clases `sm:` dependen del viewport, así
  // que en móvil no servirían para la imagen: por eso usamos esta bandera.
  const [capturing, setCapturing] = useState(false);

  // pixelRatio dinámico: maximiza la calidad sin superar los límites de canvas
  // del navegador (lado máx ~16384px y área máx ~256MP en iOS/Safari). Con muchos
  // objetos el nodo crece y un ratio fijo desbordaría el canvas, dejándolo en blanco.
  const calcPixelRatio = (node: HTMLElement) => {
    const { width, height } = node.getBoundingClientRect();
    if (!width || !height) return 2.5;

    const MAX_SIDE = 16384; // límite de ancho/alto de canvas
    const MAX_AREA = 16_000_000; // ~16MP de margen seguro para iOS/Safari
    const TARGET = 2.5; // calidad HD deseada

    const ratioBySide = Math.min(MAX_SIDE / width, MAX_SIDE / height);
    const ratioByArea = Math.sqrt(MAX_AREA / (width * height));

    // Nunca subir de TARGET ni bajar de 1 (mínimo aceptable)
    return Math.max(1, Math.min(TARGET, ratioBySide, ratioByArea));
  };

  // Ancho FIJO del contenido (las filas se renderizan siempre a este ancho, donde
  // el grid de 3 columnas se ve equilibrado y sin huecos). El alto es automático:
  // la imagen se ajusta a la altura real del contenido según la cantidad de objetos.
  const CONTENT_WIDTH = 1100;

  // anchoObjetivo: si se indica, fija el ancho final de la imagen en px (tope).
  // Por defecto las tres acciones (compartir, copiar, descargar) usan máxima
  // resolución vía calcPixelRatio. La vía de mejor calidad para WhatsApp es
  // Compartir (manda el archivo sin recomprimir); Copiar/Descargar sirven el
  // PNG en alta resolución para otros usos (documentos, email, impresión).
  const generarPng = async (anchoObjetivo?: number) => {
    const node = captureRef.current;
    if (!node) return null;

    // Activar layout de 3 columnas y esperar a que React lo pinte antes de medir.
    setCapturing(true);
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    // Esperar a que TODAS las imágenes del nodo terminen (carguen o fallen) antes de
    // capturar. Sin esto, la primera captura sale incompleta (imágenes aún cargando)
    // y un artículo sin foto deja la promesa colgada para siempre.
    await Promise.all(
      Array.from(node.querySelectorAll('img')).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            const done = () => {
              img.removeEventListener('load', done);
              img.removeEventListener('error', done);
              resolve();
            };
            img.addEventListener('load', done);
            img.addEventListener('error', done);
            // Tope de seguridad: si una imagen nunca responde, no bloquear la captura.
            setTimeout(done, 4000);
          })
      )
    );

    // Respetar el tema actual: usar el fondo real del modal (claro u oscuro)
    const bg = getComputedStyle(node).backgroundColor || '#ffffff';

    // --- Ajustes de tamaño sólo durante la captura ---
    // Guardamos los estilos inline que tocamos para restaurarlos exactamente.
    const prev = {
      width: node.style.width,
      boxSizing: node.style.boxSizing,
    };
    const basePadLeft = parseFloat(getComputedStyle(node).paddingLeft) || 0;
    const basePadRight = parseFloat(getComputedStyle(node).paddingRight) || 0;

    // El contenido se renderiza al ancho fijo (abarca todo el ancho, sin estirar
    // filas ni dejar márgenes). El alto queda automático según la cantidad de
    // objetos: no agregamos relleno vertical, así no hay franjas en blanco.
    node.style.boxSizing = 'border-box';
    node.style.width = `${CONTENT_WIDTH + basePadLeft + basePadRight}px`;

    // Forzar reflujo y medir el ancho final ya aplicado.
    const finalWidth = node.getBoundingClientRect().width || 1;

    const pixelRatio = anchoObjetivo
      ? Math.min(calcPixelRatio(node), anchoObjetivo / finalWidth)
      : calcPixelRatio(node);

    try {
      // Sin cacheBust para reutilizar la caché del navegador en vez de
      // re-descargar las imágenes desde la API.
      return await toBlob(node, {
        pixelRatio,
        backgroundColor: bg,
      });
    } finally {
      // Restaurar siempre los estilos para no afectar la vista en pantalla.
      node.style.width = prev.width;
      node.style.boxSizing = prev.boxSizing;
      setCapturing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const png = await generarPng();
      if (!png) return;
      const url = URL.createObjectURL(png);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cotizacion-lubrimec-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generando PNG:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      // Máxima calidad (sin acotar el ancho).
      const png = await generarPng();
      if (!png) return;
      // El portapapeles de imágenes sólo existe en contexto seguro (HTTPS/localhost).
      // En HTTP (p. ej. probando por IP de red) navigator.clipboard es undefined:
      // avisamos y descargamos como respaldo en vez de crashear.
      if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
        alert('Copiar requiere una conexión segura (HTTPS). Descargando la imagen…');
        await handleDownload();
        return;
      }
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
          className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
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

          <div ref={captureRef} className="px-4 pt-3 pb-3 space-y-4 bg-card">
            {/* Encabezado: logo a la izquierda, vehículo y fecha a la derecha */}
            <div className="flex items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Lubrimec" className="h-16 w-auto object-contain" />
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
                {pct > 0 && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                    Descuento otorgado: {pct}%
                  </p>
                )}
              </div>
            </div>

            {/* Marcas de filtros: fila por producto → imagen | nombre | precio */}
            {filtrosList.length > 0 && (
              <div>
                <h3 className={`font-bold text-foreground mb-2 text-center ${capturing ? 'text-2xl' : 'text-sm'}`}>
                  {filtrosList.length === 1 ? 'Filtro' : 'Filtros'}
                </h3>
                <div className="space-y-1.5">
                  {filtrosList.map(({ key, tipo, filtro }) => {
                    const filtroDesc = pct > 0 ? filtro!.precio * (1 - pct / 100) : undefined;
                    const filtroImg = filtro!.idArticulo ? imgUrl(filtro!.idArticulo) : undefined;

                    // ── Captura: tarjeta premium ──
                    if (capturing) {
                      return (
                        <div
                          key={key}
                          className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg flex items-stretch"
                        >
                          <div className="shrink-0 p-3">
                            <div className="w-44 rounded-xl bg-white border border-border overflow-hidden">
                              <ProductImage src={filtroImg} alt={filtro!.nombre} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 py-4 pr-3 flex flex-col justify-center gap-1">
                            <span className="text-sm font-bold uppercase tracking-widest text-primary">
                              {tipo}
                            </span>
                            <p className="text-xl font-extrabold text-foreground leading-tight break-words">
                              {filtro!.nombre}
                            </p>
                          </div>
                          <div className="shrink-0 self-stretch bg-primary/10 border-l-2 border-primary px-5 py-4 flex flex-col items-end justify-center gap-1 min-w-[12rem]">
                            {filtroDesc != null && filtroDesc < filtro!.precio && (
                              <span className="text-base text-muted-foreground line-through">{fmt(filtro!.precio)}</span>
                            )}
                            <span className="text-3xl font-extrabold text-foreground leading-none">
                              {fmt(filtroDesc ?? filtro!.precio)}
                            </span>
                            {filtroDesc != null && filtroDesc < filtro!.precio && (
                              <span className="mt-1 inline-block rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white">
                                Ahorrás {fmt(filtro!.precio - filtroDesc)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // ── Pantalla ──
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-[auto_1fr_auto] items-center rounded-xl border border-border bg-secondary/20 gap-2 sm:gap-3 p-2"
                      >
                        <div className="shrink-0 w-24 sm:w-32">
                          <ProductImage src={filtroImg} alt={filtro!.nombre} />
                        </div>
                        <div className="min-w-0 leading-tight">
                          <p className="font-semibold uppercase tracking-wide text-primary text-[10px]">
                            {tipo}
                          </p>
                          <p className="text-foreground break-words text-xs">{filtro!.nombre}</p>
                        </div>
                        <div className="shrink-0">
                          <PriceBlock lista={filtro!.precio} desc={filtroDesc} align="right" size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Marcas de aceites: fila por producto → imagen | precio aceite | total con filtros */}
            {aceites.length > 0 && (
              <div>
                <h3 className={`font-bold text-foreground mb-2 text-center ${capturing ? 'text-2xl' : 'text-sm'}`}>
                  {aceites.length === 1 ? 'Aceite' : 'Aceites'}
                </h3>
                <div className="space-y-1.5">
                  {aceites.map((a) => {
                    const p = aceitePrecios.get(a.id);
                    // Fallback: aceite no devuelto por la cotización → precio bruto del catálogo
                    const bruto = 'precioBruto' in a ? a.precioBruto ?? undefined : undefined;
                    const listaAceite = p?.lista ?? bruto;
                    const descAceite = p?.desc ?? (bruto != null ? conDesc(bruto) : undefined);
                    const totalLista = p?.totalLista ?? (bruto != null ? bruto + filtrosListaSum : undefined);
                    const totalDesc = p?.totalDesc ?? (bruto != null ? conDesc(bruto) + filtrosDescSum : undefined);
                    const tieneTotal = totalLista != null && totalLista > 0;
                    const ahorroTotal =
                      totalLista != null && totalDesc != null && totalDesc < totalLista
                        ? totalLista - totalDesc
                        : 0;

                    // ── Captura: tarjeta premium impactante ──
                    if (capturing) {
                      return (
                        <div
                          key={a.id}
                          className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg flex items-stretch"
                        >
                          {/* Imagen protagonista */}
                          <div className="shrink-0 p-3">
                            <div className="w-44 rounded-xl bg-white border border-border overflow-hidden">
                              <ProductImage src={imgUrl(a.id)} alt={a.nombre} />
                            </div>
                          </div>

                          {/* Nombre + precio del aceite */}
                          <div className="flex-1 min-w-0 py-4 pr-3 flex flex-col justify-center gap-1">
                            <p className="text-xl font-extrabold text-foreground leading-tight break-words">
                              {a.nombre}
                            </p>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Aceite
                              </span>
                              <PriceBlock lista={listaAceite} desc={descAceite} align="left" size="smBig" />
                            </div>
                          </div>

                          {/* Bloque destacado: TOTAL con filtros */}
                          {tieneTotal && (
                            <div className="shrink-0 self-stretch bg-primary/10 border-l-2 border-primary px-5 py-4 flex flex-col items-end justify-center gap-1 min-w-[12rem]">
                              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                Total con filtros
                              </span>
                              {totalLista != null && totalDesc != null && totalDesc < totalLista && (
                                <span className="text-base text-muted-foreground line-through">{fmt(totalLista)}</span>
                              )}
                              <span className="text-3xl font-extrabold text-foreground leading-none">
                                {fmt(totalDesc ?? totalLista!)}
                              </span>
                              {ahorroTotal > 0 && (
                                <span className="mt-1 inline-block rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white">
                                  Ahorrás {fmt(ahorroTotal)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // ── Pantalla (no captura): layout responsive existente ──
                    return (
                      <div
                        key={a.id}
                        className="rounded-xl border border-border bg-secondary/20 p-2 flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(11rem,1.4fr)_1fr_1fr] sm:items-center sm:gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 w-24 sm:w-32">
                            <ProductImage src={imgUrl(a.id)} alt={a.nombre} />
                          </div>
                          <p className="text-foreground leading-tight break-words min-w-0 font-semibold text-xs">
                            {a.nombre}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:contents">
                          <div className="leading-tight">
                            <p className="font-semibold uppercase tracking-wide text-muted-foreground text-center text-[10px] mb-0.5">
                              Aceite
                            </p>
                            <PriceBlock lista={listaAceite} desc={descAceite} align="center" size="sm" />
                          </div>
                          <div className="leading-tight">
                            {tieneTotal ? (
                              <>
                                <p className="font-semibold uppercase tracking-wide text-primary text-right text-[10px] mb-0.5">
                                  Total con filtros
                                </p>
                                <PriceBlock lista={totalLista} desc={totalDesc} size="lg" align="right" />
                              </>
                            ) : (
                              <p className="text-[10px] text-right text-muted-foreground">—</p>
                            )}
                          </div>
                        </div>
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
              <p className={`font-bold text-primary pt-1 ${capturing ? 'text-lg' : 'text-xs'}`}>
                Visitá nuestro sitio web www.lubrimec.shop
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="sticky bottom-0 flex gap-2 sm:gap-3 border-t border-border bg-card/95 backdrop-blur px-3 py-3 sm:px-6 sm:py-4">
            <button
              onClick={handleDownload}
              disabled={downloading || copying}
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-base hover:bg-primary/90 transition disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-5 h-5 shrink-0 animate-spin" /> : <Download className="w-5 h-5 shrink-0" />}
              <span className="truncate">Descargar</span>
            </button>
            <button
              onClick={handleCopy}
              disabled={downloading || copying}
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 rounded-xl border-2 border-border text-foreground font-semibold text-sm sm:text-base hover:bg-secondary transition disabled:opacity-50"
            >
              {copying ? (
                <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
              ) : copied ? (
                <Check className="w-5 h-5 shrink-0 text-emerald-500" />
              ) : (
                <Copy className="w-5 h-5 shrink-0" />
              )}
              <span className="truncate">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
