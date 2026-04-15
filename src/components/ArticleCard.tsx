import React, { useEffect, useRef, useState } from "react";
import placeholder from "@/assets/product-oil.jpg";
import { API_BASE } from "@/lib/config";

interface Props {
  articulo: {
    id_articulo: number;
    descripcion_articulo: string;
    imagen?: string | null;
  };
}

// Cache simple en memoria para evitar múltiples fetch por el mismo id.
const imageCache = new Map<number, string | null>();

const ArticleCard: React.FC<Props> = ({ articulo }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | undefined>(
    articulo.imagen && (articulo.imagen as string).startsWith("data:")
      ? (articulo.imagen as string)
      : undefined
  );

  useEffect(() => {
    const node = cardRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let mounted = true;
    const id = articulo.id_articulo;

    // Si la API de lista ya trae una URL o data URL válida, la usamos.
    if (articulo.imagen && typeof articulo.imagen === "string" && (articulo.imagen.startsWith("data:") || articulo.imagen.startsWith("http") || articulo.imagen.startsWith("/"))) {
      setImgSrc(articulo.imagen);
      return;
    }

    const cached = imageCache.get(id);
    if (cached !== undefined) {
      setImgSrc(cached || undefined);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/josegalvez/paginaweb/articulosimg?id=${id}`, {
          headers: { Accept: "application/json" },
          redirect: "follow",
        });

        if (!mounted) {
          return;
        }

        if (!res.ok) {
          imageCache.set(id, null);
          setImgSrc(undefined);
          return;
        }

        const data = await res.json();
        const base64 = data?.imagen_base64;
        const mime = data?.mime_type || "image/jpeg";

        if (base64) {
          const src = `data:${mime};base64,${base64}`;
          imageCache.set(id, src);
          if (mounted) {
            setImgSrc(src);
          }
          return;
        }

        imageCache.set(id, null);
        if (mounted) {
          setImgSrc(undefined);
        }
      } catch {
        imageCache.set(id, null);
        if (mounted) {
          setImgSrc(undefined);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [articulo.id_articulo, articulo.imagen, isVisible]);

  const finalSrc = imgSrc || placeholder;

  return (
    <div ref={cardRef} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <img
        src={finalSrc}
        alt={articulo.descripcion_articulo}
        className="w-full h-40 object-cover rounded-md mb-3"
        loading="lazy"
      />
      <h3 className="text-base font-medium text-foreground">{articulo.descripcion_articulo}</h3>
    </div>
  );
};

export default ArticleCard;
