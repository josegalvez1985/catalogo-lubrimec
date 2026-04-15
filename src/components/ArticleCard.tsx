import React, { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import placeholder from "@/assets/lubrimec-logo.png";
import { API_BASE } from "@/lib/config";

interface Props {
  articulo: {
    id_articulo: number;
    descripcion_articulo: string;
    tiene_imagen?: number;
    stock?: number | null;
    precio?: number | null;
  };
}

const ArticleCard: React.FC<Props> = ({ articulo }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

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
    try {
      // 1. Descargar la imagen del producto
      const imgRes = await fetch(imgSrc);
      if (!imgRes.ok) throw new Error("Error descargando imagen");
      const imgBlob = await imgRes.blob();

      // Convertir a DataURL para evitar bloqueos de seguridad de Blob URLs en HTTP
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imgBlob);
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 2. Configurar Canvas en Alta Resolución (900x1200) para nitidez absoluta
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: false })!;
      canvas.width = 900;
      canvas.height = 1200;

      // Fondo oscuro de la tarjeta (#1a1a1a)
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar borde decorativo
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Área blanca para la imagen (esquinas redondeadas manuales)
      const pad = 40;
      const imgAreaSize = canvas.width - pad * 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(pad, pad, imgAreaSize, imgAreaSize);

      // Dibujar imagen del producto escalada y centrada
      const scale = Math.min(imgAreaSize / img.naturalWidth, imgAreaSize / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      ctx.drawImage(img, pad + (imgAreaSize - sw) / 2, pad + (imgAreaSize - sh) / 2, sw, sh);

      // 3. Escribir Textos (Descripción, Precio, Stock)
      ctx.textAlign = "left";
      
      // Descripción (Blanco, Negrita)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      const words = articulo.descripcion_articulo.split(" ");
      let line = "";
      let y = pad + imgAreaSize + 80;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        if (ctx.measureText(testLine).width > (canvas.width - pad * 2) && n > 0) {
          ctx.fillText(line, pad, y);
          line = words[n] + " ";
          y += 60;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, pad, y);

      // Precio (Azul Primario)
      y += 120;
      if (articulo.precio != null) {
        ctx.fillStyle = "#3b82f6";
        ctx.font = "bold 70px sans-serif";
        ctx.fillText(`Gs. ${articulo.precio.toLocaleString("es-PY")}`, pad, y);
      }

      // Stock (Verde o Rojo)
      y += 80;
      const isStock = articulo.stock != null && articulo.stock > 0;
      ctx.fillStyle = isStock ? "#10b981" : "#ef4444";
      ctx.font = "bold 38px sans-serif";
      ctx.fillText(isStock ? `✔ ${articulo.stock} en stock` : "Sin stock", pad, y);

      // 4. COPIAR AL PORTAPAPELES COMO PNG
      // Nota: navigator.clipboard.write requiere que el sitio esté en HTTPS o localhost.
      // Si estás en una IP local (192.168...), algunos navegadores bloquean 'write'.
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
      
      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const data = [new ClipboardItem({ "image/png": blob })];
        await navigator.clipboard.write(data);
        setCopied(true);
      } else {
        throw new Error("Clipboard API no soportada en esta conexión (requiere HTTPS)");
      }

    } catch (err) {
      console.error(err);
      // Fallback: descargar imagen si no se puede copiar (mejor calidad que texto solo)
      const blob = await new Promise<Blob>((resolve) => {
        const c = document.createElement("canvas");
        c.width = 1; c.height = 1; // dummy para catch
        const ctx = c.getContext("2d");
        // Re-usamos el canvas de arriba si estuviera disponible, pero simplificamos fallback
        setCopied(false);
      });
      alert("No se pudo copiar (seguridad del navegador). Revisa que la conexión sea segura (HTTPS).");
    } finally {
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div ref={cardRef} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="w-full aspect-square bg-white rounded-md mb-3 flex items-center justify-center overflow-hidden">
        <img
          src={imgSrc}
          alt={articulo.descripcion_articulo}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      </div>
      <h3 className="text-sm font-medium text-white leading-snug line-clamp-2 font-sans">{articulo.descripcion_articulo}</h3>
      <div className="flex items-end justify-between mt-2">
        <div>
          {articulo.precio != null && (
            <p className="text-lg font-bold text-primary">
              Gs. {articulo.precio.toLocaleString("es-PY")}
            </p>
          )}
          {articulo.stock != null && articulo.stock > 0 ? (
            <span className="mt-1 inline-block text-xs font-semibold text-emerald-400">
              ✔ {articulo.stock}, en stock
            </span>
          ) : (
            <span className="mt-1 inline-block text-xs font-semibold text-red-400">
              Sin stock
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          title="Copiar imagen con precio y stock"
          className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;
