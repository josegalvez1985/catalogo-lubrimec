import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { API_BASE, WHATSAPP_NUMBER } from "@/lib/config";
import placeholder from "@/assets/lubrimec-logo.png";
import type { Articulo } from "@/hooks/useArticulos";
import { buildProductCanvas } from "@/lib/productCanvas";

interface ProductModalProps {
  articulo: Articulo | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  articulo, isOpen, onClose, onPrev, onNext, hasPrev, hasNext,
}) => {
  const [zoomed, setZoomed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

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

  // Keyboard + back button
  React.useEffect(() => {
    if (!isOpen) return;

    // Empujar una entrada al historial para capturar el botón "Atrás" del celular
    window.history.pushState({ modal: true }, "");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomed) setZoomed(false);
        else onClose();
      }
      if (e.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    };

    const handlePopState = () => {
      if (zoomed) setZoomed(false);
      else onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext, zoomed]);

  // Reset al cambiar de producto
  React.useEffect(() => {
    setZoomed(false);
    setCopied(false);
    setCopying(false);
    setImgLoaded(false);
  }, [articulo?.id_articulo]);

  if (!articulo) return null;

  const hasImage = articulo.tiene_imagen === 1;
  const imgSrc = hasImage
    ? `${API_BASE}/josegalvez/paginaweb/articulosimg/${articulo.id_articulo}`
    : placeholder;

  const handleCopy = async () => {
    if (copying) return;
    setCopying(true);
    try {
      const blob = await buildProductCanvas(imgSrc, articulo);

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
          articulo.precio != null ? `Gs. ${new Intl.NumberFormat("es-PY").format(articulo.precio)}` : "",
          articulo.stock != null && articulo.stock > 0 ? `${articulo.stock} en stock` : "Sin stock",
        ].filter(Boolean).join(" — ");
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } catch {
        alert("No se pudo copiar. Revisa que la conexión sea segura (HTTPS).");
      }
    } finally {
      setCopying(false);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Hola, consulto por: ${articulo.descripcion_articulo}${articulo.precio != null ? ` (Gs. ${new Intl.NumberFormat("es-PY").format(articulo.precio)})` : ""}`
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

            {/* Image con skeleton mientras carga */}
            <div
              className="relative w-full bg-white flex items-center justify-center p-4 sm:p-6 cursor-zoom-in"
              style={{ minHeight: "220px", maxHeight: "42vh" }}
              onClick={() => setZoomed(true)}
            >
              {/* Skeleton */}
              {!imgLoaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-t-2xl" />
              )}
              <img
                src={imgSrc}
                alt={articulo.descripcion_articulo}
                className={`max-w-full object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                style={{ maxHeight: "38vh" }}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholder;
                  setImgLoaded(true);
                }}
              />
              <button
                className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition"
                onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
                aria-label="Ampliar imagen"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
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
              <h2 id="product-modal-title" className="text-lg font-semibold text-white font-sans leading-snug">
                {articulo.descripcion_articulo}
              </h2>

              {articulo.descripcion_marca && (
                <p className="text-sm text-muted-foreground">
                  Marca: <span className="text-foreground font-medium">{articulo.descripcion_marca}</span>
                </p>
              )}

              <div className="flex items-end justify-between gap-4">
                {articulo.precio != null ? (
                  <p className="text-2xl font-bold text-primary">
                    Gs. {new Intl.NumberFormat("es-PY").format(articulo.precio)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Precio no disponible</p>
                )}

                {articulo.stock != null && articulo.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/15 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {articulo.stock} en stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-500/15 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Sin stock
                  </span>
                )}
              </div>

              {articulo.descripcion_rubro && (
                <p className="text-xs text-muted-foreground">
                  Rubro: {articulo.descripcion_rubro}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleCopy}
                      disabled={copying}
                      aria-label="Copiar imagen del producto"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copying ? "Copiando..." : copied ? "¡Copiado!" : "Copiar imagen"}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Copiar imagen del producto al portapapeles</p>
                  </TooltipContent>
                </Tooltip>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Consultar por este producto
                </a>
              </div>
            </div>
          </motion.div>

          {/* Fullscreen zoom overlay */}
          <AnimatePresence>
            {zoomed && (
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
                  src={imgSrc}
                  alt={articulo.descripcion_articulo}
                  className="max-w-[95vw] max-h-[95vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholder;
                  }}
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
