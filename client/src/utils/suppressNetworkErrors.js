// Suprimir errores de red en la consola del navegador
// Esto previene que errores esperados (como 503 cuando el backend no está disponible)
// llenen la consola del navegador

(function() {
  'use strict';

  // Guardar funciones originales
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Patrones de errores a silenciar
  const silentPatterns = [
    /503/i,
    /Service Unavailable/i,
    /Failed to load resource/i,
    /ECONNREFUSED/i,
    /ERR_NETWORK/i,
    /Network Error/i,
    /WebSocket connection failed/i,
    /failed to connect to websocket/i,
    /\[vite\] failed to connect/i,
  ];

  // Función para verificar si un mensaje debe ser silenciado
  function shouldSilence(message) {
    if (!message) return false;
    const msg = String(message);
    return silentPatterns.some(pattern => pattern.test(msg));
  }

  // Sobrescribir console.error
  console.error = function(...args) {
    const firstArg = args[0];
    const message = String(firstArg || '');
    
    // Silenciar errores de red
    if (shouldSilence(message)) {
      return;
    }
    
    // Verificar en todos los argumentos
    const hasSilentError = args.some(arg => {
      if (typeof arg === 'string') return shouldSilence(arg);
      if (arg instanceof Error) return shouldSilence(arg.message);
      if (arg && typeof arg === 'object') {
        return shouldSilence(JSON.stringify(arg));
      }
      return false;
    });
    
    if (hasSilentError) {
      return;
    }
    
    // Mostrar error normal
    originalError.apply(console, args);
  };

  // Sobrescribir console.warn
  console.warn = function(...args) {
    const firstArg = args[0];
    const message = String(firstArg || '');
    
    // Silenciar warnings de WebSocket
    if (shouldSilence(message)) {
      return;
    }
    
    // Mostrar warning normal
    originalWarn.apply(console, args);
  };

  // Interceptar errores de red globales
  window.addEventListener('error', function(event) {
    const message = event.message || '';
    const source = event.filename || '';
    
    // Silenciar errores 503 y de conexión
    if (shouldSilence(message) || 
        shouldSilence(source) ||
        source.includes('AuthContext')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Interceptar promesas rechazadas
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    let message = '';
    
    if (reason instanceof Error) {
      message = reason.message;
    } else if (typeof reason === 'string') {
      message = reason;
    } else if (reason && typeof reason === 'object') {
      message = JSON.stringify(reason);
    }
    
    // Silenciar errores de conexión
    if (shouldSilence(message) || 
        reason?.response?.status === 503 ||
        reason?.code === 'ECONNREFUSED' ||
        reason?.code === 'ERR_NETWORK') {
      event.preventDefault();
      return false;
    }
  });

  console.log('✅ Filtro de errores de red activado');
})();


