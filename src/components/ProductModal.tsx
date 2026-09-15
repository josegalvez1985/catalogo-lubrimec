import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MessageCircle, Download, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ProductPlaceholder from "@/components/ProductPlaceholder";
import { API_BASE, WHATSAPP_NUMBER } from "@/lib/config";
import lubrimecLogo from "@/assets/lubrimec-logo.png";
import type { Articulo } from "@/hooks/useArticulos";
import { buildProductCanvas } from "@/lib/productCanvas";
import { useCart } from "@/hooks/useCart";
import type { RankBadge } from "@/lib/salesRanking";

interface ProductModalProps {
  articulo: Articulo | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  rankBadge?: RankBadge;
}

const fmt = (n: number) => new Intl.NumberFormat("es-PY").format(n);

const ProductModal: React.FC<ProductModalProps> = ({
  articulo, isOpen, onClose, onPrev, onNext, hasPrev, hasNext, rankBadge,
}) => {
  const [zoomed, setZoomed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, getCantidad } = useCart();

  // Swipe táctil
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Solo activar si el movimiento es principalmente horizontal y supera 60px
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && hasNext) onNext?.();
      if (dx > 0 && hasPrev) onPrev?.();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // El padre recrea estos handlers en cada render. Se leen desde un ref para
  // que el efecto de abajo corra una sola vez por apertura del modal.
  const latest = useRef({ onClose, onPrev, onNext, hasPrev, hasNext, zoomed });
  latest.current = { onClose, onPrev, onNext, hasPrev, hasNext, zoomed };

  // Teclado + botón "Atrás" del celular
  useEffect(() => {
    if (!isOpen) return;

    // Una sola entrada de historial por apertura: "Atrás" cierra el modal
    window.history.pushState({ modal: true }, "");
    let closedByBack = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      const h = latest.current;
      if (e.key === "Escape") {
        if (h.zoomed) setZoomed(false);
        else h.onClose();
      }
      if (e.key === "ArrowLeft" && h.hasPrev) h.onPrev?.();
      if (e.key === "ArrowRight" && h.hasNext) h.onNext?.();
    };

    const handlePopState = () => {
      if (latest.current.zoomed) {
        // "Atrás" con la imagen ampliada solo cierra el zoom
        setZoomed(false);
        window.history.pushState({ modal: true }, "");
      } else {
        closedByBack = true;
        latest.current.onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
      document.body.style.overflow = "";
      // Cerrado con X, fondo o Escape: quitar la entrada que agregamos
      if (!closedByBack && window.history.state?.modal) window.history.back();
    };
  }, [isOpen]);

  // Reset al cambiar de producto
  useEffect(() => {
    setZoomed(false);
    setCopied(false);
    setCopying(false);
    setDownloading(false);
    setImgLoaded(false);
    setImgError(false);
    setAdded(false);
  }, [articulo?.id_articulo]);

  if (!articulo) return null;

  const showImage = articulo.tiene_imagen === 1 && !imgError;
  const imgUrl = `${API_BASE}/josegalvez/paginaweb/articulosimg/${articulo.id_articulo}`;
  // Sin foto real, la imagen compartida lleva el logo
  const canvasSrc = showImage ? imgUrl : lubrimecLogo;

  const stock = articulo.stock ?? 0;
  const tieneStock = stock > 0;
  const enCarrito = getCantidad(articulo.id_articulo);
  const limiteAlcanzado = articulo.stock != null && enCarrito >= stock;

  const tieneDescuento =
    articulo.precio != null && articulo.precioLista != null && articulo.precioLista > articulo.precio;
  const pctDescuento = tieneDescuento
    ? Math.round((1 - articulo.precio! / articulo.precioLista!) * 100)
    : 0;

  const handleCopy = async () => {
    if (copying) return;
    setCopying(true);
    try {
      const blob = await buildProductCanvas(canvasSrc, articulo, rankBadge);

      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
      } else {
        throw new Error("Clipboard API no disponible (requiere HTTPS)");
      }
    } catch (err) {
      console.error(err);
      try {
        const text = [
          articulo.descripcion_articulo,
          articulo.descripcion_marca ? `Marca: ${articulo.descripcion_marca}` : "",
          articulo.precio != null ? `Gs. ${fmt(articulo.precio)}` : "",
          tieneStock ? `${stock} en stock` : "Sin stock",
        ].filter(Boolean).join(" — ");
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } catch {
        toast.error("No se pudo copiar", { description: "Revisá que la conexión sea segura (HTTPS)." });
      }
    } finally {
      setCopying(false);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await buildProductCanvas(canvasSrc, articulo, rankBadge);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${articulo.descripcion_articulo.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "producto"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo generar la imagen", { description: "Intentá de nuevo." });
    } finally {
      setDownloading(false);
    }
  };

  const handleAdd = () => {
    if (!tieneStock || limiteAlcanzado) return;
    addItem(articulo, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const whatsappMsg = encodeURIComponent(
    `Hola, consulto por: ${articulo.descripcion_articulo}${articulo.precio != null ? ` (Gs. ${fmt(articulo.precio)})` : ""}`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Prev/Next — fuera del modal, con mejor tamaño táctil */}
          {hasPrev && (
            <button
              onClick={onPrev}
              className="absolute left-1 sm:left-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-background/90 hover:bg-background text-foreground shadow-lg transition active:scale-95"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-1 sm:right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-background/90 hover:bg-background text-foreground shadow-lg transition active:scale-95"
              aria-label="Producto siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Modal */}
          <motion.div
            className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl w-full mx-8 sm:mx-0 sm:max-w-lg max-h-[92vh] overflow-y-auto"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-background/80 hover:bg-background text-foreground transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Imagen con skeleton mientras carga */}
            <div
              className={`relative w-full bg-white flex items-center justify-center p-4 sm:p-6 ${showImage ? "cursor-zoom-in" : ""}`}
              style={{ minHeight: "220px", maxHeight: "42vh" }}
              onClick={() => showImage && setZoomed(true)}
            >
              {showImage ? (
                <>
                  {!imgLoaded && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-t-2xl" />
                  )}
                  <img
                    src={imgUrl}
                    alt={articulo.descripcion_articulo}
                    className={`max-w-full object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                    style={{ maxHeight: "38vh" }}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                  />
                </>
              ) : (
                <div className="w-full h-[180px]">
                  <ProductPlaceholder rubro={articulo.descripcion_rubro} iconClassName="w-24 h-24" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                {rankBadge && (
                  <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${rankBadge.className}`}>
                    {rankBadge.emoji} {rankBadge.label}
                  </span>
                )}
                {articulo.valoracion_marca != null && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white/90 shadow-sm"
                    title="Valoración de la marca"
                    aria-label={`Marca valorada con ${articulo.valoracion_marca} de 5 estrellas`}
                  >
                    Marca
                    <span className="inline-flex gap-0.5 text-sm" aria-hidden="true">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < articulo.valoracion_marca! ? "text-yellow-400" : "text-white/30"}>★</span>
                      ))}
                    </span>
                  </span>
                )}
              </div>
              {showImage ? (
                <button
                  className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition"
                  onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
                  aria-label="Ampliar imagen"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              ) : (
                <span className="absolute bottom-3 left-3 text-xs font-medium bg-black/60 text-white/90 px-1.5 py-0.5 rounded">
                  Sin foto
                </span>
              )}
            </div>

            {/* Indicador de swipe en mobile */}
            {(hasPrev || hasNext) && (
              <div className="flex justify-center gap-1.5 py-2 sm:hidden">
                {hasPrev && <span className="text-xs text-muted-foreground">← anterior</span>}
                {hasPrev && hasNext && <span className="text-xs text-muted-foreground">·</span>}
                {hasNext && <span className="text-xs text-muted-foreground">siguiente →</span>}
              </div>
            )}

            {/* Details */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <h2 id="product-modal-title" className="text-lg font-semibold text-foreground font-sans leading-snug">
                  {articulo.descripcion_articulo}
                </h2>
                {/* Metadata tags */}
                {articulo.descripcion_rubro && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {articulo.descripcion_rubro}
                    </span>
                  </div>
                )}
              </div>

              {articulo.descripcion_marca && (
                <p className="text-sm text-muted-foreground">
                  Marca: <span className="text-foreground font-medium">{articulo.descripcion_marca}</span>
                </p>
              )}

              <div className="flex items-end justify-between gap-4">
                {articulo.precio != null ? (
                  <div>
                    {tieneDescuento && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          Gs. {fmt(articulo.precioLista!)}
                        </span>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          -{pctDescuento}%
                        </span>
                      </div>
                    )}
                    <p className="text-2xl font-bold text-primary">
                      Gs. {fmt(articulo.precio)}
                    </p>
                    {tieneDescuento && (
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Ahorrás Gs. {fmt(articulo.precioLista! - articulo.precio)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Precio no disponible</p>
                )}

                {tieneStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {stock} en stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-500/15 text-red-600 dark:text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400" />
                    Sin stock
                  </span>
                )}
              </div>

              {/* Acciones: primero comprar/consultar, después compartir */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAdd}
                  disabled={!tieneStock || limiteAlcanzado}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {added ? <Check className="w-4 h-4 shrink-0" /> : <ShoppingCart className="w-4 h-4 shrink-0" />}
                  {added
                    ? "¡Agregado al carrito!"
                    : !tieneStock
                      ? "Sin stock"
                      : limiteAlcanzado
                        ? "Ya tenés todo el stock en el carrito"
                        : "Agregar al carrito"}
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  {tieneStock ? "Consultar por este producto" : "Consultar disponibilidad"}
                </a>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleCopy}
                        disabled={copying}
                        aria-label="Copiar imagen del producto"
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {copying ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                        <span className="truncate">{copying ? "Copiando..." : copied ? "¡Copiado!" : "Copiar"}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Copiar imagen del producto al portapapeles</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        aria-label="Descargar imagen del producto"
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
                        <span className="truncate">{downloading ? "Generando..." : "Descargar"}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Descargar imagen del producto</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fullscreen zoom overlay */}
          <AnimatePresence>
            {zoomed && showImage && (
              <motion.div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 cursor-zoom-out"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setZoomed(false)}
              >
                <button
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                  onClick={() => setZoomed(false)}
                  aria-label="Cerrar zoom"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <img
                  src={imgUrl}
                  alt={articulo.descripcion_articulo}
                  className="max-w-[95vw] max-h-[95vh] object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
