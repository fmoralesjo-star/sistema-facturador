// EMERGENCY RESET SERVICE WORKER v4.0.0
// Este SW reemplaza al defectuoso y devuelve el control a la red inmediatamente.
// Eliminamos cualquier lógica de fetch para evitar errores "Failed to construct Request".

const CACHE_NAME = 'sistema-facturador-v4-RESET';

self.addEventListener('install', (event) => {
  console.log('[SW Reset] Instalando nuevo SW seguro v4...');
  // Forzar activación inmediata
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW Reset] Activando y limpiando TODO...');

  event.waitUntil(
    Promise.all([
      // 1. Borrar todos los caches existentes
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW Reset] Borrando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // 2. Tomar control inmediato de todas las pestañas
      self.clients.claim()
    ]).then(() => {
      console.log('[SW Reset] Control tomado. La red es directa ahora.');
      // Opcional: Forzar recarga de clientes para asegurar que usen la red?
      // No necesario si no tenemos fetch handler, el browser usará red.

      // Notificar a los clientes que recarguen la pagina si es necesario
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_RESET_COMPLETE' }));
      });
    })
  );
});

// NO listener de 'fetch'.
// Todo tráfico va directo a la red.
