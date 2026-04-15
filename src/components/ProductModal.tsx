import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { API_BASE } from "@/lib/config";
import placeholder from "@/assets/lubrimec-logo.png";
import type { Articulo } from "@/hooks/useArticulos";

interface ProductModalProps {
  articulo: Articulo | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ articulo, isOpen, onClose }) => {
  if (!articulo) return null;

  const hasImage = articulo.tiene_imagen === 1;
  const imgSrc = hasImage
    ? `${API_BASE}/josegalvez/paginaweb/articulosimg/${articulo.id_articulo}`
    : placeholder;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
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

            {/* Image */}
            <div className="w-full bg-white flex items-center justify-center p-6" style={{ maxHeight: "50vh" }}>
              <img
                src={imgSrc}
                alt={articulo.descripcion_articulo}
                className="max-w-full max-h-[45vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholder;
                }}
              />
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white font-sans leading-snug">
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
                    Gs. {articulo.precio.toLocaleString("es-PY")}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
