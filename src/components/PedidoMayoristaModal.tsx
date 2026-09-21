import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check, Loader2, MessageCircle, Image as ImageIcon, ImageOff } from "lucide-react";
import { toast } from "sonner";
import ProductPlaceholder from "@/components/ProductPlaceholder";
import lubrimecLogo from "@/assets/lubrimec-logo.png";
import { API_BASE, WHATSAPP_NUMBER, DESCUENTO_MAYORISTA } from "@/lib/config";
import { capturarNodoPng, descargarBlob } from "@/lib/pngExport";
import { useListaMayorista } from "@/hooks/useListaMayorista";

const fmt = (n: number) => new Intl.NumberFormat("es-PY").format(n);

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Ancho fijo del documento al capturarlo: a este ancho la tabla queda equilibrada. */
const CONTENT_WIDTH = 1100;

/** Con más líneas que esto las fotos hacen la imagen enorme y lenta de generar. */
const MAX_ITEMS_CON_FOTO = 12;

export default function PedidoMayoristaModal({ isOpen, onClose }: Props) {
  const { items, cliente, totalUnidades, totalLineas, totalPrecio, totalLista } = useListaMayorista();
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [conFotos, setConFotos] = useState(true);

  // Mientras capturamos forzamos los tamaños grandes: las clases `sm:` dependen
  // del viewport, no del ancho al que renderizamos la imagen, así que desde un
  // celular el PNG saldría con la tipografía chica estirada a 1100px.
  const [capturing, setCapturing] = useState(false);
  const c = (normal: string, captura: string) => (capturing ? captura : normal);

  // Número y fecha se fijan al abrir el modal, no en cada render: si cambiaran
  // mientras el cliente mira la lista, la imagen no coincidiría con lo que vio.
  const { numero, fecha } = useMemo(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return {
      numero: `MAY-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`,
      fecha: d.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric" }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Las fotos se deciden al abrir, según el largo del pedido en ese momento.
  useEffect(() => {
    if (isOpen) setConFotos(items.length <= MAX_ITEMS_CON_FOTO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const ahorro = totalLista - totalPrecio;

  const generarPng = (anchoObjetivo?: number) =>
    capturarNodoPng(captureRef.current, {
      contentWidth: CONTENT_WIDTH,
      anchoObjetivo,
      onAntes: () => setCapturing(true),
      onDespues: () => setCapturing(false),
    });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const png = await generarPng();
      if (!png) return;
      descargarBlob(png, `pedido-mayorista-lubrimec-${numero}.png`);
    } catch (e) {
      console.error("Error generando PNG:", e);
      toast.error("No se pudo generar la imagen", { description: "Intentá de nuevo." });
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      // El portapapeles de imágenes sólo existe en contexto seguro (HTTPS/localhost).
      if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
        toast.info("Copiar requiere una conexión segura (HTTPS)", { description: "Descargando la imagen…" });
        await handleDownload();
        return;
      }
      // Safari/iOS invalidan el permiso de escritura si entre el gesto del usuario
      // y el write() pasa demasiado tiempo. Pasar una Promise<Blob> mantiene vivo
      // el gesto: el navegador espera a que la promesa resuelva.
      const pngPromise = generarPng().then((png) => {
        if (!png) throw new Error("No se pudo generar el PNG");
        return png;
      });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngPromise })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Error copiando imagen:", e);
      // Si el portapapeles rechaza la imagen, no dejar al cliente sin resultado.
      try {
        await handleDownload();
      } catch {
        toast.error("No se pudo copiar ni descargar la imagen", { description: "Intentá de nuevo." });
      }
    } finally {
      setCopying(false);
    }
  };

  const whatsappUrl = useMemo(() => {
    const lineas = items.map((i, n) => {
      const sub = (i.precio ?? 0) * i.cantidad;
      const precioTxt = i.precio != null ? ` - Gs. ${fmt(i.precio)} c/u = Gs. ${fmt(sub)}` : " - a consultar";
      const marca = i.descripcion_marca ? ` (${i.descripcion_marca})` : "";
      return `${n + 1}. ${i.cantidad}x ${i.descripcion_articulo}${marca}${precioTxt}`;
    });
    const msg =
      `*PEDIDO MAYORISTA ${numero}*\n` +
      (cliente ? `Cliente: ${cliente}\n` : "") +
      `\n${lineas.join("\n")}\n\n` +
      `${totalLineas} producto${totalLineas !== 1 ? "s" : ""} - ${totalUnidades} unidad${totalUnidades !== 1 ? "es" : ""}\n` +
      `*TOTAL: Gs. ${fmt(totalPrecio)}*`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [items, cliente, numero, totalLineas, totalUnidades, totalPrecio]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl my-0 sm:my-4 bg-card border border-border sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Barra superior */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-foreground truncate">Tu pedido mayorista</h2>
                <p className="text-xs text-muted-foreground">
                  {totalLineas} producto{totalLineas !== 1 ? "s" : ""} · {totalUnidades} unidad
                  {totalUnidades !== 1 ? "es" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setConFotos((v) => !v)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
                  title={conFotos ? "Sacar las fotos hace la imagen más liviana" : "Mostrar las fotos de los productos"}
                >
                  {conFotos ? <ImageIcon className="w-4 h-4" /> : <ImageOff className="w-4 h-4" />}
                  {conFotos ? "Con fotos" : "Solo texto"}
                </button>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Vista previa del documento */}
            <div className="max-h-[65vh] overflow-y-auto overflow-x-auto bg-secondary/20 p-3 sm:p-6">
              <div
                ref={captureRef}
                className={`mx-auto bg-card text-foreground rounded-xl border border-border ${c("p-5 sm:p-8", "p-8")}`}
                style={{ minWidth: 320 }}
              >
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-primary">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={lubrimecLogo}
                      alt=""
                      className={`object-contain shrink-0 ${c("w-12 h-12 sm:w-14 sm:h-14", "w-14 h-14")}`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`font-bold tracking-widest text-foreground leading-none ${c("text-lg sm:text-2xl", "text-2xl")}`}
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        LUBRIMEC
                      </p>
                      <p className={`text-muted-foreground mt-1 ${c("text-[10px] sm:text-xs", "text-xs")}`}>
                        Lubricantes y filtros · Capiatá, Paraguay
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-primary uppercase tracking-wide ${c("text-xs sm:text-sm", "text-sm")}`}>
                      Pedido mayorista
                    </p>
                    <p className={`text-muted-foreground mt-0.5 tabular-nums ${c("text-[10px] sm:text-xs", "text-xs")}`}>
                      {numero}
                    </p>
                    <p className={`text-muted-foreground tabular-nums ${c("text-[10px] sm:text-xs", "text-xs")}`}>{fecha}</p>
                  </div>
                </div>

                {cliente && (
                  <p className={`mt-3 ${c("text-xs sm:text-sm", "text-sm")}`}>
                    <span className="text-muted-foreground">Cliente: </span>
                    <span className="font-semibold text-foreground">{cliente}</span>
                  </p>
                )}

                {/* Tabla */}
                <table className="w-full mt-4 border-collapse">
                  <thead>
                    <tr className="bg-secondary/60">
                      <th
                        className={`text-left font-bold uppercase tracking-wide text-muted-foreground px-2 py-2 rounded-l-md w-8 ${c("text-[10px] sm:text-xs", "text-xs")}`}
                      >
                        #
                      </th>
                      {conFotos && <th className="px-2 py-2 w-14" />}
                      <th
                        className={`text-left font-bold uppercase tracking-wide text-muted-foreground px-2 py-2 ${c("text-[10px] sm:text-xs", "text-xs")}`}
                      >
                        Producto
                      </th>
                      <th
                        className={`text-center font-bold uppercase tracking-wide text-muted-foreground px-2 py-2 w-16 ${c("text-[10px] sm:text-xs", "text-xs")}`}
                      >
                        Cant.
                      </th>
                      <th
                        className={`text-right font-bold uppercase tracking-wide text-muted-foreground px-2 py-2 w-28 ${c("text-[10px] sm:text-xs", "text-xs")}`}
                      >
                        P. Unit.
                      </th>
                      <th
                        className={`text-right font-bold uppercase tracking-wide text-muted-foreground px-2 py-2 rounded-r-md w-32 ${c("text-[10px] sm:text-xs", "text-xs")}`}
                      >
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => {
                      const sub = (item.precio ?? 0) * item.cantidad;
                      return (
                        <tr key={item.id_articulo} className={i % 2 === 1 ? "bg-secondary/20" : ""}>
                          <td
                            className={`px-2 py-2 text-muted-foreground tabular-nums align-middle ${c("text-[10px] sm:text-xs", "text-xs")}`}
                          >
                            {i + 1}
                          </td>
                          {conFotos && (
                            <td className="px-2 py-2 align-middle">
                              <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden">
                                {item.tiene_imagen === 1 ? (
                                  <img
                                    src={`${API_BASE}/josegalvez/paginaweb/articulosimg/${item.id_articulo}`}
                                    alt=""
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : (
                                  <ProductPlaceholder rubro={item.descripcion_rubro} iconClassName="w-5 h-5" />
                                )}
                              </div>
                            </td>
                          )}
                          <td className="px-2 py-2 align-middle">
                            <p className={`font-medium text-foreground leading-snug ${c("text-xs sm:text-sm", "text-sm")}`}>
                              {item.descripcion_articulo}
                            </p>
                            {item.descripcion_marca && (
                              <p className={`text-muted-foreground ${c("text-[10px] sm:text-xs", "text-xs")}`}>
                                {item.descripcion_marca}
                              </p>
                            )}
                          </td>
                          <td
                            className={`px-2 py-2 text-center font-bold text-foreground tabular-nums align-middle ${c("text-xs sm:text-sm", "text-sm")}`}
                          >
                            {item.cantidad}
                          </td>
                          <td
                            className={`px-2 py-2 text-right text-foreground tabular-nums align-middle whitespace-nowrap ${c("text-xs sm:text-sm", "text-sm")}`}
                          >
                            {item.precio != null ? `Gs. ${fmt(item.precio)}` : "A consultar"}
                          </td>
                          <td
                            className={`px-2 py-2 text-right font-bold text-foreground tabular-nums align-middle whitespace-nowrap ${c("text-xs sm:text-sm", "text-sm")}`}
                          >
                            {item.precio != null ? `Gs. ${fmt(sub)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totales */}
                <div className="mt-4 flex justify-end">
                  <div className={`space-y-1.5 ${c("w-full sm:w-80", "w-80")}`}>
                    <div
                      className={`flex items-center justify-between text-muted-foreground ${c("text-[11px] sm:text-xs", "text-xs")}`}
                    >
                      <span>Precio de lista</span>
                      <span className="tabular-nums line-through">Gs. {fmt(totalLista)}</span>
                    </div>
                    <div
                      className={`flex items-center justify-between font-semibold text-emerald-600 dark:text-emerald-400 ${c("text-[11px] sm:text-xs", "text-xs")}`}
                    >
                      <span>Descuento mayorista {DESCUENTO_MAYORISTA}%</span>
                      <span className="tabular-nums">− Gs. {fmt(ahorro)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-1 border-t-2 border-primary">
                      <span className={`font-bold text-foreground ${c("text-sm sm:text-base", "text-base")}`}>TOTAL</span>
                      <span className={`font-bold text-primary tabular-nums ${c("text-lg sm:text-2xl", "text-2xl")}`}>
                        Gs. {fmt(totalPrecio)}
                      </span>
                    </div>
                    <p className={`text-right text-muted-foreground tabular-nums ${c("text-[10px] sm:text-xs", "text-xs")}`}>
                      {totalLineas} producto{totalLineas !== 1 ? "s" : ""} · {totalUnidades} unidad
                      {totalUnidades !== 1 ? "es" : ""}
                    </p>
                  </div>
                </div>

                {/* Nota legal */}
                <div className="border-t border-border mt-5 pt-3 text-center space-y-0.5">
                  <p className={`font-medium text-foreground ${c("text-[10px] sm:text-[11px]", "text-[11px]")}`}>
                    Pedido válido por 5 días a partir de la fecha de emisión.
                  </p>
                  <p className={`text-muted-foreground ${c("text-[10px] sm:text-[11px]", "text-[11px]")}`}>
                    Precios mayoristas sujetos a confirmación y a disponibilidad de stock.
                  </p>
                  <p className={`text-muted-foreground ${c("text-[10px] sm:text-[11px]", "text-[11px]")}`}>
                    Los precios y promociones no aplican los días domingos ni feriados.
                  </p>
                  <p className={`font-bold text-primary pt-1 ${c("text-xs sm:text-sm", "text-sm")}`}>
                    www.lubrimec.shop · +595 974 759 037
                  </p>
                </div>
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
                <span className="truncate">{copied ? "Copiado" : "Copiar"}</span>
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm sm:text-base hover:bg-green-700 transition"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span className="truncate">Enviar</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
