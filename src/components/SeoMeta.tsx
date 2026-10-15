import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PAGE_META, NOT_FOUND_META, canonicalUrl } from "@/lib/seo";

function setMeta(selector: string, content: string) {
  document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", content);
}

// Al navegar dentro de la SPA el HTML no se recarga: actualizamos acá las
// mismas etiquetas que vite.config.ts escribe en cada dist/<ruta>.html, para
// que Google (que ejecuta JS) y la pestaña vean el título de la página actual.
export default function SeoMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
    const meta = PAGE_META[path] ?? NOT_FOUND_META;
    const url = canonicalUrl(PAGE_META[path] ? path : "/");

    document.title = meta.title;
    setMeta('meta[name="description"]', meta.description);
    setMeta('meta[property="og:title"]', meta.title);
    setMeta('meta[property="og:description"]', meta.description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', meta.title);
    setMeta('meta[name="twitter:description"]', meta.description);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", url);

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (meta.noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex";
    } else {
      robots?.remove();
    }
  }, [pathname]);

  return null;
}
