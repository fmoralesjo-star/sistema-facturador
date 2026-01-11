// Versión del cache - incrementar para forzar actualización
// Cambiar este número cada vez que quieras forzar una actualización
const CACHE_VERSION = 'v2.2.1-FIX-NAVIGATE';
const CACHE_NAME = `sistema-facturador-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/facturacion',
  '/contabilidad',
  '/clientes',
  '/productos',
  '/inventario',
  '/index.html',
  '/manifest.json'
];

// Instalación del Service Worker - Forzar actualización inmediata
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  // Detectar si estamos en desarrollo (puerto 5173)
  const isDevelopment = self.location.origin.includes(':5173') ||
    self.location.origin.includes('localhost:5173') ||
    self.location.origin.includes('127.0.0.1:5173');

  // EN DESARROLLO: No instalar cache, solo activar inmediatamente
  if (isDevelopment) {
    console.log('[SW] Modo desarrollo detectado - sin cache');
    self.skipWaiting();
    return;
  }

  // EN PRODUCCIÓN: Instalar con cache
  // NO forzar skipWaiting inmediatamente para evitar recargas constantes
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache abierto:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch((err) => {
          console.log('[SW] Error al cachear algunos recursos:', err);
        });
      })
      .then(() => {
        console.log('[SW] Service Worker instalado');
        // NO hacer skipWaiting automáticamente - esperar a que el usuario recargue
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
      .then(() => {
        // NO tomar control inmediatamente para evitar recargas
        // return self.clients.claim();
        console.log('[SW] Service Worker activado (sin claim inmediato)');
      })
  );
});

// Estrategia: Network First, luego Cache (solo en producción)
self.addEventListener('fetch', (event) => {
  // Ignorar requests que no son GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No interceptar requests a la API - dejarlos pasar directamente
  if (event.request.url.includes('/api/') ||
    (event.request.url.includes('localhost:3001') && !event.request.url.includes('run.app')) ||
    event.request.url.includes('socket.io')) {
    return;
  }

  // No interceptar requests a recursos externos
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // EN DESARROLLO: No cachear nada, siempre usar la red
  // Detectar desarrollo por el puerto 5173 (Vite dev server)
  if (event.request.url.includes(':5173') ||
    event.request.url.includes('localhost:5173') ||
    event.request.url.includes('127.0.0.1:5173')) {
    // En desarrollo, solo pasar la petición sin cachear
    return;
  }

  // EN PRODUCCIÓN: Usar estrategia Network First - SIEMPRE buscar en la red primero
  // Usamos cache: 'no-store' para evitar el cache HTTP del navegador

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        // NO cachear nada - siempre usar la versión más reciente de la red
        return response;
      })
      .catch((error) => {
        // Si falla la red, intentar usar cache como último recurso
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Usando cache como fallback:', event.request.url);
            return cachedResponse;
          }
          // Si no hay cache, devolver una respuesta de error básica
          return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Solo hacer skipWaiting si el usuario lo solicita explícitamente
    self.skipWaiting().then(() => {
      // Notificar a los clientes que pueden recargar
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_READY_TO_ACTIVATE',
            version: CACHE_VERSION
          });
        });
      });
    });
  }

  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Forzar verificación de actualización
    self.registration.update();
  }
});

