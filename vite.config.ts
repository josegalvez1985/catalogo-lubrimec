import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Proxy para desarrollo: reenvía /ords/* a oracleapex para evitar problemas CORS
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
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
