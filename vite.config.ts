import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { PAGE_META, applyMetaToHtml } from "./src/lib/seo";

// GitHub Pages no conoce las rutas de React Router: sin esto, /catalogo cae en
// 404.html y responde HTTP 404, y Google no indexa la página. Generando
// dist/catalogo.html (copia de index.html con su título y descripción),
// Pages sirve /catalogo con 200 y el resultado de Google muestra el título
// propio de cada página.
function seoPages(): Plugin {
  let outDir = "dist";
  return {
    name: "lubrimec-seo-pages",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return applyMetaToHtml(html, "/", PAGE_META["/"]);
    },
    closeBundle() {
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const html = fs.readFileSync(indexPath, "utf-8");
      for (const [route, meta] of Object.entries(PAGE_META)) {
        if (route === "/") continue;
        fs.writeFileSync(path.join(outDir, `${route.slice(1)}.html`), applyMetaToHtml(html, route, meta));
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Proxy para desarrollo: reenv�a /ords/* a oracleapex para evitar problemas CORS
    proxy: {
      '/ords': {
        target: 'https://oracleapex.com',
        changeOrigin: true,
        // Some ORDS deployments are strict about TLS/Origin; allow insecure TLS and
        // force Origin header to the target to reduce chance of server-side rejects.
        secure: false,
        headers: {
          origin: 'https://oracleapex.com'
        },
        rewrite: (path) => path.replace(/^\/ords/, '/ords')
      }
    }
  },
  plugins: [react(), seoPages()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
