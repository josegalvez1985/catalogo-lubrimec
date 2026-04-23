import React, { useEffect, useRef, useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import placeholder from "@/assets/lubrimec-logo.png";
import { API_BASE } from "@/lib/config";
import { buildProductCanvas } from "@/lib/productCanvas";

interface Props {
  articulo: {
    id_articulo: number;
    descripcion_articulo: string;
    descripcion_marca?: string | null;
    tiene_imagen?: number;
    stock?: number | null;
    precio?: number | null;
  };
  searchQuery?: string;
}

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

const ArticleCard: React.FC<Props> = ({ articulo, searchQuery }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

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
  const hasImage = articulo.tiene_imagen === 1;
  const imgSrc =
    hasImage && isVisible && !hasError
      ? `${API_BASE}/josegalvez/paginaweb/articulosimg/${articulo.id_articulo}`
      : placeholder;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div ref={cardRef} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
      <div className="relative w-full aspect-square bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden">
        <img
          src={imgSrc}
          alt={articulo.descripcion_articulo}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          onError={() => setHasError(true)}
        />
        {(!hasImage || hasError) && (
          <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-black/60 text-white/80 px-1.5 py-0.5 rounded">
            Sin foto
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-white leading-snug line-clamp-2 font-sans">
        <HighlightText text={articulo.descripcion_articulo} query={searchQuery} />
      </h3>
      {articulo.descripcion_marca && (
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{articulo.descripcion_marca}</p>
      )}
      <div className="flex items-end justify-between mt-2">
        <div>
          {articulo.precio != null && (
            <p className="text-lg font-bold text-primary">
              Gs. {new Intl.NumberFormat("es-PY").format(articulo.precio)}
            </p>
          )}
          {articulo.stock != null && articulo.stock > 0 ? (
            <span className="mt-1 inline-block text-xs font-semibold text-emerald-400">
              ✔ {articulo.stock} en stock
            </span>
          ) : (
            <span className="mt-1 inline-block text-xs font-semibold text-red-400">
              Sin stock
            </span>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              disabled={copying}
              aria-label="Copiar imagen con precio y stock"
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{copying ? "Copiando..." : copied ? "¡Copiado!" : "Copiar imagen del producto"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ArticleCard;
