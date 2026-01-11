// EMERGENCY RESET SERVICE WORKER v3.0.0
// Este SW reemplaza al defectuoso y devuelve el control a la red inmediatamente.

const CACHE_NAME = 'sistema-facturador-v3-RESET';

self.addEventListener('install', (event) => {
  console.log('[SW Reset] Instalando nuevo SW seguro...');
  // Forzar activación inmediata para reemplazar al SW roto
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW Reset] Activando y limpiando caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW Reset] Borrando cache antiguo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW Reset] Tomando control de los clientes...');
      return self.clients.claim();
    })
  );
});

// NO agregamos listener de 'fetch'
// Esto hace que todas las peticiones vayan directo a la red sin intervención del SW.
// Es la forma más segura de arreglar el error "Failed to construct Request".

