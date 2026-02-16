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
        secure: true,
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
