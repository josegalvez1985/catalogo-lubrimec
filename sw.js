// Service Worker "kill switch".
// La app dejó de usar PWA/caché: queremos que SIEMPRE se consulte la red.
// Este SW reemplaza al anterior, borra todas sus cachés y se auto-desinstala.
// Los navegadores que ya tenían el SW viejo instalado lo actualizarán a este,
// que limpia todo y se quita a sí mismo.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Borrar todas las cachés que dejó la PWA anterior.
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      // Tomar control de las páginas abiertas.
      await self.clients.claim();
      // Desregistrar este Service Worker.
      await self.registration.unregister();
      // Forzar recarga de las pestañas para que dejen de usar el SW.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});

// Mientras siga activo, no interceptar nada: todo va directo a la red.
