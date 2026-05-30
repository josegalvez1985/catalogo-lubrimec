import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// La app NO debe cachear nada: siempre consultar la red en cada navegación.
// Desregistramos cualquier Service Worker previo (PWA antigua) y borramos sus
// cachés, para que dispositivos que ya tenían el SW instalado dejen de servir
// contenido viejo desde la caché.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) registration.unregister();
  });
}
if ("caches" in window) {
  caches.keys().then((keys) => {
    for (const key of keys) caches.delete(key);
  });
}
