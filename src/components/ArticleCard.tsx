import React, { useEffect, useRef, useState } from "react";
import { Copy, Check, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ProductPlaceholder from "@/components/ProductPlaceholder";
import lubrimecLogo from "@/assets/lubrimec-logo.png";
import { API_BASE } from "@/lib/config";
import { buildProductCanvas } from "@/lib/productCanvas";
import { useCart } from "@/hooks/useCart";
import type { Articulo } from "@/hooks/useArticulos";
import type { RankBadge } from "@/lib/salesRanking";

interface Props {
  articulo: Articulo;
  searchQuery?: string;
  rankBadge?: RankBadge;
}

const fmt = (n: number) => new Intl.NumberFormat("es-PY").format(n);

/** Resalta coincidencias de búsqueda en un texto */
function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || query.trim() === "") return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const lowerQuery = query.toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerQuery ? (
          <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const ArticleCard: React.FC<Props> = ({ articulo, searchQuery, rankBadge }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, getCantidad } = useCart();

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // URL directa al Media Resource de ORDS — el navegador recibe la imagen como binario.
  const showImage = articulo.tiene_imagen === 1 && !hasError;
  const imgUrl = `${API_BASE}/josegalvez/paginaweb/articulosimg/${articulo.id_articulo}`;

  const stock = articulo.stock ?? 0;
  const tieneStock = stock > 0;
  const enCarrito = getCantidad(articulo.id_articulo);
  const limiteAlcanzado = articulo.stock != null && enCarrito >= stock;
  const puedeAgregar = tieneStock && !limiteAlcanzado;

  const tieneDescuento =
    articulo.precio != null && articulo.precioLista != null && articulo.precioLista > articulo.precio;
  const pctDescuento = tieneDescuento
    ? Math.round((1 - articulo.precio! / articulo.precioLista!) * 100)
    : 0;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (copying) return;
    setCopying(true);
    try {
      // Sin foto real, la imagen compartida lleva el logo (no el ícono de categoría)
      const blob = await buildProductCanvas(showImage ? imgUrl : lubrimecLogo, articulo, rankBadge);

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

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!puedeAgregar) return;
    addItem(articulo, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const addTooltip = added
    ? "¡Agregado!"
    : !tieneStock
      ? "Sin stock — consultá por WhatsApp"
      : limiteAlcanzado
        ? "Ya tenés todo el stock disponible en el carrito"
        : enCarrito > 0
          ? "Agregar otro"
          : "Agregar al carrito";

  return (
    <div ref={cardRef} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
      <div className="relative w-full aspect-square bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden">
        {showImage ? (
          isVisible && (
            <img
              src={imgUrl}
              alt={articulo.descripcion_articulo}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              onError={() => setHasError(true)}
            />
          )
        ) : (
          <ProductPlaceholder rubro={articulo.descripcion_rubro} />
        )}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {rankBadge && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rankBadge.className}`}>
              {rankBadge.emoji} {rankBadge.label}
            </span>
          )}
          {articulo.valoracion_marca != null && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white/90 shadow-sm"
              title="Valoración de la marca"
              aria-label={`Marca valorada con ${articulo.valoracion_marca} de 5 estrellas`}
            >
              Marca
              <span className="inline-flex gap-px" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < articulo.valoracion_marca! ? "text-yellow-400" : "text-white/30"}>★</span>
                ))}
              </span>
            </span>
          )}
        </div>
        {!showImage && (
          <span className="absolute bottom-2 left-2 text-xs font-medium bg-black/60 text-white/90 px-1.5 py-0.5 rounded">
            Sin foto
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 font-sans">
        <HighlightText text={articulo.descripcion_articulo} query={searchQuery} />
      </h3>
      {articulo.descripcion_marca && (
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{articulo.descripcion_marca}</p>
      )}
      <div className="flex items-end justify-between gap-2 mt-2">
        <div className="min-w-0">
          {articulo.precio != null && (
            <>
              {tieneDescuento && (
                <div className="flex flex-wrap items-center gap-x-1.5">
                  <span className="text-xs text-muted-foreground line-through whitespace-nowrap">
                    Gs. {fmt(articulo.precioLista!)}
                  </span>
                  <span className="text-xs font-bold px-1.5 rounded whitespace-nowrap bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    -{pctDescuento}%
                  </span>
                </div>
              )}
              <p className="text-lg font-bold text-primary">
                Gs. {fmt(articulo.precio)}
              </p>
            </>
          )}
          {tieneStock ? (
            <span className="mt-1 inline-block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ✔ {stock} en stock
            </span>
          ) : (
            <span className="mt-1 inline-block text-xs font-semibold text-red-600 dark:text-red-400">
              Sin stock
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleAdd}
                aria-label={addTooltip}
                aria-disabled={!puedeAgregar}
                className={`p-2 rounded-lg transition-colors ${
                  !puedeAgregar
                    ? "bg-secondary/50 text-muted-foreground opacity-50 cursor-not-allowed"
                    : enCarrito > 0
                      ? "bg-primary/15 text-primary hover:bg-primary/25"
                      : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {added ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <ShoppingCart className="w-4 h-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{addTooltip}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                disabled={copying}
                aria-label="Copiar imagen con precio y stock"
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{copying ? "Copiando..." : copied ? "¡Copiado!" : "Copiar imagen del producto"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
