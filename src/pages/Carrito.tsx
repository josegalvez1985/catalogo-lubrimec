import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Minus, Plus, MessageCircle, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { API_BASE, WHATSAPP_NUMBER } from "@/lib/config";
import placeholder from "@/assets/lubrimec-logo.png";

const fmt = (n: number) => new Intl.NumberFormat("es-PY").format(n);

const Carrito = () => {
  const { items, totalItems, totalPrecio, setCantidad, removeItem, clear } = useCart();

  const buildWhatsappUrl = () => {
    const lineas = items.map((i) => {
      const sub = (i.precio ?? 0) * i.cantidad;
      const precioTxt = i.precio != null ? ` — Gs. ${fmt(i.precio)} c/u = Gs. ${fmt(sub)}` : "";
      return `• ${i.cantidad}x ${i.descripcion_articulo}${i.descripcion_marca ? ` (${i.descripcion_marca})` : ""}${precioTxt}`;
    });
    const msg =
      `Hola, quiero hacer un pedido:\n\n${lineas.join("\n")}\n\n` +
      `Total: Gs. ${fmt(totalPrecio)}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-8 px-4 bg-gradient-to-b from-card/40 to-transparent border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            CARRITO
          </h1>
          <p className="text-muted-foreground text-sm">
            {totalItems > 0 ? `${totalItems} producto${totalItems !== 1 ? "s" : ""} en tu carrito` : "Tu carrito está vacío"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No agregaste productos todavía</h3>
            <p className="text-sm text-muted-foreground mb-4">Explorá el catálogo y agregá lo que necesites.</p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const imgSrc =
                    item.tiene_imagen === 1
                      ? `${API_BASE}/josegalvez/paginaweb/articulosimg/${item.id_articulo}`
                      : placeholder;
                  const sub = (item.precio ?? 0) * item.cantidad;
                  return (
                    <motion.div
                      key={item.id_articulo}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 bg-card/60 backdrop-blur-sm border border-border rounded-xl p-3 sm:p-4"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={item.descripcion_articulo}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                          {item.descripcion_articulo}
                        </h3>
                        {item.descripcion_marca && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.descripcion_marca}</p>
                        )}
                        {item.precio != null ? (
                          <p className="text-sm font-bold text-primary mt-1">Gs. {fmt(item.precio)}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic mt-1">Precio a consultar</p>
                        )}

                        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 border border-border rounded-lg">
                            <button
                              onClick={() => setCantidad(item.id_articulo, item.cantidad - 1)}
                              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-l-lg transition"
                              aria-label="Quitar uno"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium tabular-nums">{item.cantidad}</span>
                            <button
                              onClick={() => setCantidad(item.id_articulo, item.cantidad + 1)}
                              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-r-lg transition"
                              aria-label="Agregar uno"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            {item.precio != null && (
                              <span className="text-sm font-semibold text-foreground tabular-nums">Gs. {fmt(sub)}</span>
                            )}
                            <button
                              onClick={() => removeItem(item.id_articulo)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                              aria-label="Eliminar del carrito"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Resumen */}
            <div className="mt-6 bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary tabular-nums">Gs. {fmt(totalPrecio)}</span>
              </div>
              <a
                href={buildWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                Hacer pedido por WhatsApp
              </a>
              <div className="flex items-center justify-between mt-3">
                <Link to="/catalogo" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
                  <ArrowLeft className="w-4 h-4" />
                  Seguir comprando
                </Link>
                <button
                  onClick={clear}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar carrito
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Carrito;
