import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { PAGE_META, applyMetaToHtml } from "@/lib/seo";

const indexHtml = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf-8");

describe("SEO por página", () => {
  it("reescribe título, descripción, og, twitter y canonical de cada ruta", () => {
    const html = applyMetaToHtml(indexHtml, "/catalogo", PAGE_META["/catalogo"]);
    const { title, description } = PAGE_META["/catalogo"];

    expect(html).toContain(`<title>${title}</title>`);
    expect(html).toContain(`<meta name="description" content="${description}"`);
    expect(html).toContain(`<meta property="og:title" content="${title}"`);
    expect(html).toContain(`<meta name="twitter:description" content="${description}"`);
    expect(html).toContain('<meta property="og:url" content="https://www.lubrimec.shop/catalogo"');
    expect(html).toContain('<link rel="canonical" href="https://www.lubrimec.shop/catalogo"');
    expect(html).not.toContain('name="robots"');
  });

  it("marca noindex las páginas personales como el carrito", () => {
    const html = applyMetaToHtml(indexHtml, "/carrito", PAGE_META["/carrito"]);
    expect(html).toContain('<meta name="robots" content="noindex" />');
  });

  it("los títulos y descripciones entran en el resultado de Google", () => {
    for (const [route, meta] of Object.entries(PAGE_META)) {
      expect(meta.title.length, `título de ${route}`).toBeLessThanOrEqual(60);
      expect(meta.description.length, `descripción de ${route}`).toBeLessThanOrEqual(160);
    }
  });

  it("los datos estructurados son JSON válido y nombran el sitio Lubrimec", () => {
    const json = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const data = JSON.parse(json ?? "");
    const website = data["@graph"].find((n: { "@type": string }) => n["@type"] === "WebSite");
    expect(website.name).toBe("Lubrimec");
  });
});
